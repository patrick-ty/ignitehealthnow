from typing import Protocol

from app.core import get_settings


class KMSClient(Protocol):
    """Protocol for KMS clients."""

    def encrypt(self, key_name: str, plaintext: bytes) -> bytes: ...

    def decrypt(self, key_name: str, ciphertext: bytes) -> bytes: ...


class GoogleKMSClient:
    """Google Cloud KMS client wrapper."""

    def __init__(self, quota_project: str | None = None):
        try:
            from google.cloud import kms  # type: ignore
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(
                "google-cloud-kms is required for KMS operations. Install dependencies or set a fake client for tests."
            ) from exc
        # Bill KMS API usage to the key's own project, not the ambient ADC
        # quota project (which may be a different project without KMS enabled).
        client_options = {"quota_project_id": quota_project} if quota_project else None
        self._client = kms.KeyManagementServiceClient(client_options=client_options)

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
    # Key resource: projects/<project>/locations/.../cryptoKeys/...
    parts = settings.gcp_kms_key.split("/")
    quota_project = parts[1] if len(parts) > 2 and parts[0] == "projects" else None
    return GoogleKMSClient(quota_project=quota_project)
