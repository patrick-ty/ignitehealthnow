import base64
import json
import os
from dataclasses import dataclass

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.kms import KMSClient


@dataclass
class Envelope:
    v: int
    kms_key: str
    dek_wrapped: str
    nonce: str
    ciphertext: str
    tag: str | None = None

    def to_bytes(self) -> bytes:
        return json.dumps(self.__dict__).encode("utf-8")

    @staticmethod
    def from_bytes(data: bytes) -> "Envelope":
        payload = json.loads(data.decode("utf-8"))
        return Envelope(**payload)


class EnvelopeEncryptor:
    """Envelope encryption helper using KMS for DEK wrapping."""

    def __init__(self, kms_client: KMSClient, kms_key: str, version: int = 1):
        if not kms_key:
            raise ValueError("GCP_KMS_KEY is required for envelope encryption")
        self.kms_client = kms_client
        self.kms_key = kms_key
        self.version = version

    def _generate_dek(self) -> bytes:
        # AES-256-GCM requires 32-byte key
        return os.urandom(32)

    def encrypt(self, plaintext: str) -> bytes:
        dek = self._generate_dek()
        wrapped_dek = self.kms_client.encrypt(self.kms_key, dek)

        aesgcm = AESGCM(dek)
        nonce = os.urandom(12)
        ct = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)

        tag = ct[-16:]
        ciphertext = ct[:-16]

        envelope = Envelope(
            v=self.version,
            kms_key=self.kms_key,
            dek_wrapped=base64.b64encode(wrapped_dek).decode("utf-8"),
            nonce=base64.b64encode(nonce).decode("utf-8"),
            ciphertext=base64.b64encode(ciphertext).decode("utf-8"),
            tag=base64.b64encode(tag).decode("utf-8"),
        )
        return envelope.to_bytes()

    def decrypt(self, envelope_bytes: bytes) -> str:
        try:
            envelope = Envelope.from_bytes(envelope_bytes)
            wrapped_dek = base64.b64decode(envelope.dek_wrapped)
            dek = self.kms_client.decrypt(envelope.kms_key, wrapped_dek)

            nonce = base64.b64decode(envelope.nonce)
            ciphertext = base64.b64decode(envelope.ciphertext)
            tag = base64.b64decode(envelope.tag) if envelope.tag else b""
            combined = ciphertext + tag

            aesgcm = AESGCM(dek)
            plaintext = aesgcm.decrypt(nonce, combined, None)
            return plaintext.decode("utf-8")
        except Exception as exc:
            raise RuntimeError("Unable to decrypt profile field") from exc
