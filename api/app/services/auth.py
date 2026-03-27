import logging
import time
from functools import lru_cache

import httpx
from fastapi import HTTPException, status
from jose import JWTError, jwk, jwt

from app.core import get_settings

logger = logging.getLogger(__name__)
UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorized",
)


class AuthService:
    """Service for JWT verification and user identity extraction."""

    def __init__(self, *, http_client: httpx.Client | None = None):
        self.settings = get_settings()
        self.jwks_url = f"{self.settings.supabase_url}/auth/v1/keys"
        self._jwks_cache: list | None = None
        self._jwks_cached_at: float = 0
        self.http_client = http_client or httpx.Client(timeout=5.0)

    def _fetch_jwks(self) -> list:
        resp = self.http_client.get(self.jwks_url)
        resp.raise_for_status()
        data = resp.json()
        return data.get("keys", [])

    def _get_jwks(self) -> list:
        if self._jwks_cache and (time.time() - self._jwks_cached_at) < 3600:
            return self._jwks_cache
        keys = self._fetch_jwks()
        self._jwks_cache = keys
        self._jwks_cached_at = time.time()
        return keys

    def _select_key(self, kid: str | None) -> dict | None:
        keys = self._get_jwks()
        if not keys:
            return None
        if not kid:
            return None
        for key in keys:
            if key.get("kid") == kid:
                return key
        return None

    def _unauthorized(self) -> HTTPException:
        return UNAUTHORIZED

    def verify_token(self, token: str) -> dict:
        """
        Verify Supabase JWT token and return claims.

        Args:
            token: JWT token from Authorization header

        Returns:
            dict: Token claims including user_id (sub)

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            alg = unverified_header.get("alg")
        except JWTError:
            kid = None
            alg = None

        try:
            if alg == "RS256":
                key = self._select_key(kid)
                if not key:
                    raise self._unauthorized()
                public_key = jwk.construct(key)
                payload = jwt.decode(
                    token,
                    public_key.to_pem().decode(),
                    algorithms=["RS256"],
                    options={"verify_aud": False},
                )
            elif alg == "HS256":
                if (
                    not self.settings.allow_hs256_fallback
                    or not self.settings.supabase_jwt_secret
                ):
                    raise self._unauthorized()
                payload = jwt.decode(
                    token,
                    self.settings.supabase_jwt_secret,
                    algorithms=["HS256"],
                    options={"verify_aud": False},
                )
            else:
                raise self._unauthorized()

            user_id = payload.get("sub")
            if not user_id:
                raise self._unauthorized()
            return payload

        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            raise self._unauthorized()

    def get_user_id(self, token: str) -> str:
        """Extract user_id from token."""
        payload = self.verify_token(token)
        return payload["sub"]


@lru_cache
def get_auth_service() -> AuthService:
    return AuthService()
