from typing import Protocol

from app.core import get_settings


class KMSClient(Protocol):
    """Protocol for KMS clients."""

    def encrypt(self, key_name: str, plaintext: bytes) -> bytes: ...

    def decrypt(self, key_name: str, ciphertext: bytes) -> bytes: ...


class GoogleKMSClient:
    """Google Cloud KMS client wrapper."""

    def __init__(self):
        try:
            from google.cloud import kms  # type: ignore
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(
                "google-cloud-kms is required for KMS operations. Install dependencies or set a fake client for tests."
            ) from exc
        self._client = kms.KeyManagementServiceClient()

    def encrypt(self, key_name: str, plaintext: bytes) -> bytes:
        try:
            response = self._client.encrypt(name=key_name, plaintext=plaintext)
            return response.ciphertext
        except Exception as exc:  # pragma: no cover - gcloud runtime
            raise RuntimeError("KMS encryption failed") from exc

    def decrypt(self, key_name: str, ciphertext: bytes) -> bytes:
        try:
            response = self._client.decrypt(name=key_name, ciphertext=ciphertext)
            return response.plaintext
        except Exception as exc:  # pragma: no cover - gcloud runtime
            raise RuntimeError("KMS decryption failed") from exc


def get_kms_client() -> KMSClient:
    """Create the KMS client using environment configuration."""
    settings = get_settings()
    if not settings.gcp_kms_key:
        raise ValueError("GCP_KMS_KEY is required for PII encryption")
    return GoogleKMSClient()
