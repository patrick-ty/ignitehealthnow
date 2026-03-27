# Dev Journal #004 - Testability Fix: Lazy ProfileService/KMS Init

**Date:** 2026-01-17  
**Scope:** Fix pytest collection failures caused by import-time KMS/service instantiation.

---

## What changed
- Removed module-level `ProfileService()` singleton; added lazy factory `get_profile_service()` to avoid creating KMS clients at import time (`api/app/services/profile.py`, `api/app/services/__init__.py`).
- Updated profile router to obtain `ProfileService` via `Depends`, so FastAPI constructs it on demand and tests can import without triggering KMS (`api/app/routers/profile.py`).
- Added test `conftest` stubs for google-cloud-kms to allow imports in environments without the dependency.
- Moved google-cloud-kms imports inside the KMS client constructor and ProfileService init path to prevent pytest collection failures when the package is absent; KMS dependency is resolved only when constructing a real client.

## Why
- Pytest collection was failing because importing `app.services.profile` instantiated `ProfileService`, which requires Google KMS and `GCP_KMS_KEY`. This breaks isolated testing and violates the “no import-time side effects” rule.
- Lazy construction and dependency injection keep encryption design intact while making tests runnable without real KMS.

## Constraints / Alternatives
- Kept envelope encryption + KMS design unchanged; only initialization timing changed.
- Alternative considered: conditionally disable KMS in tests via env flags. Rejected to keep production paths strict and avoid hidden test-only branches.
