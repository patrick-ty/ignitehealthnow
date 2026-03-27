import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from jose import jwt
from jose.utils import base64url_encode

from app.core.config import get_settings
from app.services.auth import AuthService


def _make_service(monkeypatch, jwks_payload=None):
    # clear cached settings to pick up env
    get_settings.cache_clear()

    class DummyClient:
        def __init__(self, payload):
            self.payload = payload

        def get(self, url):
            class Resp:
                def __init__(self, data):
                    self._data = data
                    self.status_code = 200

                def raise_for_status(self):
                    if self.status_code != 200:
                        raise RuntimeError("bad status")

                def json(self):
                    return self._data

            return Resp(self.payload or {"keys": []})

    client = DummyClient(jwks_payload)
    return AuthService(http_client=client)


def test_verify_token_with_jwks(monkeypatch):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_numbers = key.public_key().public_numbers()
    n = base64url_encode(
        pub_numbers.n.to_bytes((pub_numbers.n.bit_length() + 7) // 8, "big")
    ).decode()
    e = base64url_encode(
        pub_numbers.e.to_bytes((pub_numbers.e.bit_length() + 7) // 8, "big")
    ).decode()
    token = jwt.encode(
        {"sub": "user-123"}, priv_pem, algorithm="RS256", headers={"kid": "test-key"}
    )
    jwks = {"keys": [{"kty": "RSA", "n": n, "e": e, "alg": "RS256", "kid": "test-key"}]}
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "fallback")
    service = _make_service(monkeypatch, jwks)
    claims = service.verify_token(token)
    assert claims["sub"] == "user-123"


def test_verify_token_rs256_kid_mismatch(monkeypatch):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_numbers = key.public_key().public_numbers()
    n = base64url_encode(
        pub_numbers.n.to_bytes((pub_numbers.n.bit_length() + 7) // 8, "big")
    ).decode()
    e = base64url_encode(
        pub_numbers.e.to_bytes((pub_numbers.e.bit_length() + 7) // 8, "big")
    ).decode()
    token = jwt.encode(
        {"sub": "user-321"}, priv_pem, algorithm="RS256", headers={"kid": "wrong"}
    )
    jwks = {"keys": [{"kty": "RSA", "n": n, "e": e, "alg": "RS256", "kid": "test-key"}]}
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "fallback")
    service = _make_service(monkeypatch, jwks)
    with pytest.raises(HTTPException) as exc:
        service.verify_token(token)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Unauthorized"


def test_verify_token_fallback_secret(monkeypatch):
    secret = "fallback-secret"
    token = jwt.encode(
        {"sub": "user-456", "aud": "authenticated"}, secret, algorithm="HS256"
    )
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", secret)
    monkeypatch.setenv("ALLOW_HS256_FALLBACK", "true")
    service = _make_service(monkeypatch, {"keys": []})
    claims = service.verify_token(token)
    assert claims["sub"] == "user-456"


def test_hs256_rejected_when_flag_off(monkeypatch):
    secret = "fallback-secret"
    token = jwt.encode(
        {"sub": "user-789", "aud": "authenticated"}, secret, algorithm="HS256"
    )
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", secret)
    monkeypatch.setenv("ALLOW_HS256_FALLBACK", "false")
    # flag remains false by default
    service = _make_service(monkeypatch, {"keys": []})
    with pytest.raises(HTTPException) as exc:
        service.verify_token(token)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Unauthorized"


def test_hs256_flag_on_but_secret_missing(monkeypatch):
    token = jwt.encode(
        {"sub": "user-999", "aud": "authenticated"}, "unused", algorithm="HS256"
    )
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "")
    monkeypatch.setenv("ALLOW_HS256_FALLBACK", "true")
    service = _make_service(monkeypatch, {"keys": []})
    with pytest.raises(HTTPException) as exc:
        service.verify_token(token)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Unauthorized"


def test_verify_token_missing_sub(monkeypatch):
    secret = "fallback-secret"
    token = jwt.encode({"aud": "authenticated"}, secret, algorithm="HS256")
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", secret)
    service = _make_service(monkeypatch, {"keys": []})
    with pytest.raises(HTTPException) as exc:
        service.verify_token(token)
    assert exc.value.detail == "Unauthorized"


def test_verify_token_invalid(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "secret")
    service = _make_service(monkeypatch, {"keys": []})
    with pytest.raises(HTTPException) as exc:
        service.verify_token("not-a-jwt")
    assert exc.value.detail == "Unauthorized"


def test_reject_non_rs256(monkeypatch):
    secret = "fallback-secret"
    token = jwt.encode(
        {"sub": "user-512", "aud": "authenticated"}, secret, algorithm="HS512"
    )
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "x")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", secret)
    service = _make_service(monkeypatch, {"keys": []})
    with pytest.raises(HTTPException) as exc:
        service.verify_token(token)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Unauthorized"
