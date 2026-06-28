# Admin Dashboard — First Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone, admin-gated `ignitehealth-admin` Next.js app at `admin.ignitehealthnow.com` whose first live screen — Content & Social — creates/edits/approves/schedules social post drafts via new `/admin/*` endpoints in the unified API, with the Advocate chat embedded.

**Architecture:** New `admin/` Next.js 16 app (brand/auth/api/advocate copied verbatim from `web/`). The unified FastAPI gains an `/admin` router gated by an `ADMIN_EMAILS` allowlist, serving an `AdminContentPost` contract over a provider-agnostic `ContentRepository` backed by a Supabase `admin_content_posts` table. All business logic lives in the API; the admin client is thin.

**Tech Stack:** Next.js 16 (App Router, standalone output), React 19, Tailwind v4, `@supabase/ssr`; FastAPI + pydantic-settings + supabase-py; pytest (API), Vitest (admin pure helpers), Playwright MCP (manual smoke). Cloud Run + Artifact Registry + Cloud Build.

## Global Constraints

- **Isolation (hard):** No resource, credential, project ID, domain, email, Pub/Sub topic, service account, or data may reference or touch `evogolfplatform` / `evogolf.ai`. New resources live only in `ignitehealthnow-2025` and Supabase project `arxcpgonhrhdpzhgwexj`.
- **Leave `cloud_functions/marketing_agent_*` entirely untouched** — do not import, deploy, repoint, or delete them.
- **Thin client / API trust boundary:** the admin access decision and all content logic live in the API. Content endpoints enforce admin server-side (HTTP 403), not just in UI.
- **Build-time config baked:** admin image bakes `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com` and Supabase `arxcpgonhrhdpzhgwexj` (URL + anon key). The deploy script must abort if the resolved Supabase project ≠ `arxcpgonhrhdpzhgwexj`.
- **Light theme only;** brand tokens/fonts identical to `web/` (IBM Plex Sans/Serif/Mono; accent `#2E96CE`, brand-now `#7FB539`, ink `#102A3A`).
- **Advocate PHI rule:** never persist conversation to `localStorage`; only allowed key is `ihn.advocate.seen`. Advocate must never name/cite "the book"/"the framework".
- **GCP guardrails:** never change global `gcloud` config; pass `--project ignitehealthnow-2025` per command; never run destructive `gcloud` against `evogolfplatform`. A hook blocks bash commands referencing `.env` — read env via file tools or a script that opens the file internally.
- **Channels** are exactly `instagram | x | linkedin | facebook`. **Statuses** are exactly `draft | review | scheduled | published`. Email/blog channels and an actual publish pipeline are OUT OF SCOPE.
- **Each copied file** gets a first-line header comment: `// Copied from web/<path> — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.` (use `#`/`/* */` as the file's language requires).

---

## File Structure

**API (modify/create):**
- `api/app/core/config.py` — add `admin_emails` field + `admin_email_set()`.
- `api/app/services/admin_access.py` — `is_admin_email(email)`.
- `api/app/middleware/auth.py` — add `get_current_claims`, `require_admin`.
- `api/app/middleware/__init__.py` — export the two new deps.
- `api/app/models/admin.py` — `AdminMe`, `AdminContentPost`, `AdminContentCreate`, `AdminContentUpdate`, `AdminContentApprove`, `Channel`, `Status`.
- `api/app/models/__init__.py` — export admin models.
- `api/app/repositories/__init__.py`, `api/app/repositories/content_repository.py` — `ContentRepository` protocol, `InMemoryContentRepository`, `SupabaseContentRepository`, `get_content_repository`.
- `api/app/services/admin_content.py` — `AdminContentService`, transition rules, `get_admin_content_service`.
- `api/app/services/__init__.py` — export `get_admin_content_service`, `get_content_repository`.
- `api/app/routers/admin.py` — `/admin` router.
- `api/app/routers/__init__.py` + `api/app/main.py` — register `admin_router`.
- `api/migrations/0002_admin_content_posts.sql` — table DDL.
- `api/tests/test_admin_access.py`, `api/tests/test_admin_content_service.py`, `api/tests/test_admin_router.py`.

**Admin app (create under `admin/`):** scaffold config; verbatim copies of shared libs/brand/advocate/auth; `lib/api/client.ts` admin additions; `lib/content/board.ts`, `lib/content/reducer.ts`, `lib/auth/adminGuard.ts`; `components/layout/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`; `components/content/{ContentBoard,ContentColumn,ContentCard,ContentComposer}.tsx`; `app/(admin)/layout.tsx`, `app/(admin)/content/page.tsx`, `app/(admin)/[...placeholder]` coming-soon, `app/no-access/page.tsx`, `app/page.tsx`; `proxy.ts`; Vitest tests; `Dockerfile`, `cloudbuild.admin.yaml`; deploy script.

---

## Task 1: API config — ADMIN_EMAILS allowlist

**Files:**
- Modify: `api/app/core/config.py`
- Test: `api/tests/test_admin_access.py`

**Interfaces:**
- Produces: `Settings.admin_emails: str` (env `ADMIN_EMAILS`, comma-separated) and `Settings.admin_email_set() -> set[str]` (trimmed, lowercased, empties dropped).

- [ ] **Step 1: Write the failing test**

Create `api/tests/test_admin_access.py`:
```python
from app.core.config import Settings


def test_admin_email_set_parses_and_normalizes():
    s = Settings(
        supabase_url="https://x.supabase.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="j",
        admin_emails="  Admin@Ex.com , owner@ex.com ,,",
    )
    assert s.admin_email_set() == {"admin@ex.com", "owner@ex.com"}


def test_admin_email_set_empty_by_default():
    s = Settings(
        supabase_url="https://x.supabase.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="j",
    )
    assert s.admin_email_set() == set()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_access.py -q`
Expected: FAIL (`admin_emails` / `admin_email_set` missing).

- [ ] **Step 3: Implement**

In `api/app/core/config.py`, inside `Settings` (after the `environment` field), add:
```python
    # Admin access — comma-separated allowlist of admin emails (env ADMIN_EMAILS)
    admin_emails: str = ""

    def admin_email_set(self) -> set[str]:
        return {e.strip().lower() for e in self.admin_emails.split(",") if e.strip()}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_access.py -q`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add api/app/core/config.py api/tests/test_admin_access.py
git commit -m "feat(api): ADMIN_EMAILS allowlist setting"
```

---

## Task 2: API — admin access helper + auth dependencies

**Files:**
- Create: `api/app/services/admin_access.py`
- Modify: `api/app/middleware/auth.py`, `api/app/middleware/__init__.py`
- Test: `api/tests/test_admin_access.py` (extend)

**Interfaces:**
- Consumes: `get_auth_service().verify_token(token) -> dict` (claims incl. `sub`, `email`); `Settings.admin_email_set()`.
- Produces:
  - `is_admin_email(email: str | None) -> bool` (in `app/services/admin_access.py`).
  - `get_current_claims(credentials) -> dict` and `require_admin(claims) -> dict` (in `app/middleware/auth.py`, exported from `app/middleware`). `require_admin` raises 403 for non-admin emails.

- [ ] **Step 1: Write the failing test**

Append to `api/tests/test_admin_access.py`:
```python
from unittest.mock import patch
from app.services.admin_access import is_admin_email


def test_is_admin_email_uses_allowlist():
    fake = type("S", (), {"admin_email_set": lambda self: {"a@ex.com"}})()
    with patch("app.services.admin_access.get_settings", return_value=fake):
        assert is_admin_email("A@ex.com") is True
        assert is_admin_email("b@ex.com") is False
        assert is_admin_email(None) is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_access.py -q`
Expected: FAIL (`app.services.admin_access` missing).

- [ ] **Step 3: Implement the helper**

Create `api/app/services/admin_access.py`:
```python
from app.core import get_settings


def is_admin_email(email: str | None) -> bool:
    if not email:
        return False
    return email.strip().lower() in get_settings().admin_email_set()
```

- [ ] **Step 4: Implement the auth dependencies**

In `api/app/middleware/auth.py`, add below `get_current_user_id`:
```python
async def get_current_claims(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify the JWT and return its full claims (incl. sub, email)."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
        )
    claims = get_auth_service().verify_token(credentials.credentials)
    user_id_var.set(claims.get("sub", ""))
    return claims


async def require_admin(claims: dict = Depends(get_current_claims)) -> dict:
    """403 unless the verified email is on the ADMIN_EMAILS allowlist."""
    from app.services.admin_access import is_admin_email

    if not is_admin_email(claims.get("email")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return claims
```
Add `user_id_var` to the existing import: `from app.core import request_id_var, user_id_var` (already imported — confirm; if only `request_id_var, user_id_var` present, leave as is).

In `api/app/middleware/__init__.py`, replace with:
```python
from .auth import (
    get_current_claims,
    get_current_user_id,
    request_context_middleware,
    require_admin,
)

__all__ = [
    "request_context_middleware",
    "get_current_user_id",
    "get_current_claims",
    "require_admin",
]
```

- [ ] **Step 5: Run test + import smoke**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_access.py -q && .venv/bin/python -c "from app.middleware import get_current_claims, require_admin; print('ok')"`
Expected: PASS (3 passed) and `ok`.

- [ ] **Step 6: Commit**

```bash
git add api/app/services/admin_access.py api/app/middleware/auth.py api/app/middleware/__init__.py api/tests/test_admin_access.py
git commit -m "feat(api): admin access helper + get_current_claims/require_admin deps"
```

---

## Task 3: API — admin models

**Files:**
- Create: `api/app/models/admin.py`
- Modify: `api/app/models/__init__.py`
- Test: `api/tests/test_admin_content_service.py` (create, models-only portion)

**Interfaces:**
- Produces (importable from `app.models`):
  - `Channel = Literal["instagram","x","linkedin","facebook"]`
  - `Status = Literal["draft","review","scheduled","published"]`
  - `AdminMe(admin: bool, email: str)`
  - `AdminContentPost(id: str, channel: Channel, caption: str, hashtags: list[str], status: Status, scheduled_for: datetime|None, source: str|None, ai: bool, why_it_works: str|None, created_at: datetime, updated_at: datetime)`
  - `AdminContentCreate(channel: Channel, caption: str, hashtags: list[str]=[], source: str|None=None, why_it_works: str|None=None, status: Status="draft")`
  - `AdminContentUpdate(channel: Channel|None=None, caption: str|None=None, hashtags: list[str]|None=None, scheduled_for: datetime|None=None, source: str|None=None, why_it_works: str|None=None)`
  - `AdminContentApprove(edited_caption: str|None=None, scheduled_for: datetime|None=None)`

- [ ] **Step 1: Write the failing test**

Create `api/tests/test_admin_content_service.py`:
```python
from datetime import datetime, timezone
from app.models import AdminContentPost, AdminContentCreate


def test_admin_content_post_roundtrips():
    now = datetime(2026, 6, 27, tzinfo=timezone.utc)
    p = AdminContentPost(
        id="p1", channel="instagram", caption="hi", hashtags=["#a"],
        status="draft", scheduled_for=None, source=None, ai=False,
        why_it_works=None, created_at=now, updated_at=now,
    )
    assert p.channel == "instagram" and p.status == "draft"


def test_admin_content_create_defaults():
    c = AdminContentCreate(channel="x", caption="hi")
    assert c.status == "draft" and c.hashtags == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py -q`
Expected: FAIL (admin models missing).

- [ ] **Step 3: Implement**

Create `api/app/models/admin.py`:
```python
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

Channel = Literal["instagram", "x", "linkedin", "facebook"]
Status = Literal["draft", "review", "scheduled", "published"]


class AdminMe(BaseModel):
    admin: bool
    email: str


class AdminContentPost(BaseModel):
    id: str
    channel: Channel
    caption: str
    hashtags: list[str]
    status: Status
    scheduled_for: Optional[datetime]
    source: Optional[str]
    ai: bool
    why_it_works: Optional[str]
    created_at: datetime
    updated_at: datetime


class AdminContentCreate(BaseModel):
    channel: Channel
    caption: str
    hashtags: list[str] = []
    source: Optional[str] = None
    why_it_works: Optional[str] = None
    status: Status = "draft"


class AdminContentUpdate(BaseModel):
    channel: Optional[Channel] = None
    caption: Optional[str] = None
    hashtags: Optional[list[str]] = None
    scheduled_for: Optional[datetime] = None
    source: Optional[str] = None
    why_it_works: Optional[str] = None


class AdminContentApprove(BaseModel):
    edited_caption: Optional[str] = None
    scheduled_for: Optional[datetime] = None
```

In `api/app/models/__init__.py`, add after the chat import line:
```python
from .admin import (  # noqa: F401
    AdminContentApprove,
    AdminContentCreate,
    AdminContentPost,
    AdminContentUpdate,
    AdminMe,
    Channel,
    Status,
)
```
and append the names to `__all__`:
```python
    "AdminMe",
    "AdminContentPost",
    "AdminContentCreate",
    "AdminContentUpdate",
    "AdminContentApprove",
    "Channel",
    "Status",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py -q`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add api/app/models/admin.py api/app/models/__init__.py api/tests/test_admin_content_service.py
git commit -m "feat(api): admin content models"
```

---

## Task 4: API — ContentRepository (protocol + in-memory + Supabase)

**Files:**
- Create: `api/app/repositories/__init__.py`, `api/app/repositories/content_repository.py`
- Test: `api/tests/test_admin_content_service.py` (extend)

**Interfaces:**
- Produces:
  - `ContentRepository` (Protocol): `list() -> list[dict]`, `get(post_id: str) -> dict | None`, `create(data: dict) -> dict`, `update(post_id: str, changes: dict) -> dict`. Records are plain dicts with the `admin_content_posts` columns.
  - `InMemoryContentRepository` (test/dev fake) implementing the protocol; `create` injects `id`, `created_at`, `updated_at`, defaults `ai=False`, `status` honored.
  - `SupabaseContentRepository(client)` over table `admin_content_posts`.
  - `get_content_repository() -> ContentRepository` provider (returns Supabase-backed).

- [ ] **Step 1: Write the failing test**

Append to `api/tests/test_admin_content_service.py`:
```python
from app.repositories.content_repository import InMemoryContentRepository


def test_in_memory_repo_create_get_update_list():
    repo = InMemoryContentRepository()
    rec = repo.create({"channel": "x", "caption": "hi", "hashtags": [], "status": "draft"})
    assert rec["id"] and rec["created_at"] and rec["ai"] is False
    got = repo.get(rec["id"])
    assert got["caption"] == "hi"
    upd = repo.update(rec["id"], {"caption": "bye"})
    assert upd["caption"] == "bye"
    assert len(repo.list()) == 1
    assert repo.get("missing") is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py::test_in_memory_repo_create_get_update_list -q`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

Create `api/app/repositories/__init__.py`:
```python
from .content_repository import (  # noqa: F401
    ContentRepository,
    InMemoryContentRepository,
    SupabaseContentRepository,
    get_content_repository,
)

__all__ = [
    "ContentRepository",
    "InMemoryContentRepository",
    "SupabaseContentRepository",
    "get_content_repository",
]
```

Create `api/app/repositories/content_repository.py`:
```python
import uuid
from datetime import datetime, timezone
from typing import Protocol

from app.core import get_settings

TABLE = "admin_content_posts"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ContentRepository(Protocol):
    def list(self) -> list[dict]: ...
    def get(self, post_id: str) -> dict | None: ...
    def create(self, data: dict) -> dict: ...
    def update(self, post_id: str, changes: dict) -> dict: ...


class InMemoryContentRepository:
    """In-memory fake — used by tests and as a safe default if Supabase is absent."""

    def __init__(self) -> None:
        self._rows: dict[str, dict] = {}

    def list(self) -> list[dict]:
        return sorted(self._rows.values(), key=lambda r: r["created_at"], reverse=True)

    def get(self, post_id: str) -> dict | None:
        return self._rows.get(post_id)

    def create(self, data: dict) -> dict:
        now = _utcnow()
        row = {
            "id": str(uuid.uuid4()),
            "channel": data["channel"],
            "caption": data["caption"],
            "hashtags": list(data.get("hashtags") or []),
            "status": data.get("status", "draft"),
            "scheduled_for": data.get("scheduled_for"),
            "source": data.get("source"),
            "ai": bool(data.get("ai", False)),
            "why_it_works": data.get("why_it_works"),
            "created_at": now,
            "updated_at": now,
        }
        self._rows[row["id"]] = row
        return row

    def update(self, post_id: str, changes: dict) -> dict:
        row = self._rows[post_id]
        row.update({k: v for k, v in changes.items() if v is not None})
        row["updated_at"] = _utcnow()
        return row


class SupabaseContentRepository:
    """Supabase-backed repository over the admin_content_posts table."""

    def __init__(self, client) -> None:
        self.client = client

    def list(self) -> list[dict]:
        res = self.client.table(TABLE).select("*").order("created_at", desc=True).execute()
        return res.data or []

    def get(self, post_id: str) -> dict | None:
        res = self.client.table(TABLE).select("*").eq("id", post_id).limit(1).execute()
        return (res.data or [None])[0]

    def create(self, data: dict) -> dict:
        res = self.client.table(TABLE).insert(data).execute()
        return res.data[0]

    def update(self, post_id: str, changes: dict) -> dict:
        res = self.client.table(TABLE).update(changes).eq("id", post_id).execute()
        return res.data[0]


def get_content_repository() -> ContentRepository:
    from supabase import create_client

    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return SupabaseContentRepository(client)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py -q`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add api/app/repositories
git add api/tests/test_admin_content_service.py
git commit -m "feat(api): ContentRepository (protocol + in-memory + supabase)"
```

---

## Task 5: API — AdminContentService + transition rules

**Files:**
- Create: `api/app/services/admin_content.py`
- Modify: `api/app/services/__init__.py`
- Test: `api/tests/test_admin_content_service.py` (extend)

**Interfaces:**
- Consumes: `ContentRepository`, the admin models, `InMemoryContentRepository`.
- Produces:
  - `AdminContentService(repo)` with `list_posts() -> list[AdminContentPost]`, `create_post(AdminContentCreate) -> AdminContentPost`, `update_post(id, AdminContentUpdate) -> AdminContentPost`, `approve_post(id, AdminContentApprove) -> AdminContentPost`, `reject_post(id) -> AdminContentPost`.
  - `get_admin_content_service(repo=Depends(get_content_repository)) -> AdminContentService` provider.
  - Transition rules: approve → if `edited_caption`, set caption; if `scheduled_for`, status→`scheduled` + set time; elif status==`draft`, status→`review`. reject → if status != `published`, status→`draft`.

- [ ] **Step 1: Write the failing test**

Append to `api/tests/test_admin_content_service.py`:
```python
from datetime import datetime, timezone
from app.models import AdminContentApprove, AdminContentCreate, AdminContentUpdate
from app.services.admin_content import AdminContentService


def _svc():
    return AdminContentService(InMemoryContentRepository())


def test_create_and_list_returns_models():
    svc = _svc()
    post = svc.create_post(AdminContentCreate(channel="instagram", caption="hi"))
    assert post.status == "draft" and post.ai is False
    assert [p.id for p in svc.list_posts()] == [post.id]


def test_approve_draft_without_time_goes_review():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.approve_post(p.id, AdminContentApprove())
    assert out.status == "review"


def test_approve_with_time_schedules_and_edits_caption():
    svc = _svc()
    when = datetime(2026, 7, 1, 9, tzinfo=timezone.utc)
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.approve_post(p.id, AdminContentApprove(edited_caption="new", scheduled_for=when))
    assert out.status == "scheduled" and out.caption == "new" and out.scheduled_for == when


def test_reject_returns_to_draft():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi", status="review"))
    out = svc.reject_post(p.id)
    assert out.status == "draft"


def test_update_changes_fields():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.update_post(p.id, AdminContentUpdate(caption="edited"))
    assert out.caption == "edited"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py -q`
Expected: FAIL (`app.services.admin_content` missing).

- [ ] **Step 3: Implement**

Create `api/app/services/admin_content.py`:
```python
from fastapi import Depends, HTTPException, status

from app.models import (
    AdminContentApprove,
    AdminContentCreate,
    AdminContentPost,
    AdminContentUpdate,
)
from app.repositories import ContentRepository, get_content_repository


class AdminContentService:
    def __init__(self, repo: ContentRepository) -> None:
        self.repo = repo

    @staticmethod
    def _to_model(record: dict) -> AdminContentPost:
        return AdminContentPost(**record)

    def _require(self, post_id: str) -> dict:
        rec = self.repo.get(post_id)
        if rec is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return rec

    def list_posts(self) -> list[AdminContentPost]:
        return [self._to_model(r) for r in self.repo.list()]

    def create_post(self, data: AdminContentCreate) -> AdminContentPost:
        rec = self.repo.create({**data.model_dump(), "ai": False})
        return self._to_model(rec)

    def update_post(self, post_id: str, changes: AdminContentUpdate) -> AdminContentPost:
        self._require(post_id)
        rec = self.repo.update(post_id, changes.model_dump(exclude_none=True))
        return self._to_model(rec)

    def approve_post(self, post_id: str, approve: AdminContentApprove) -> AdminContentPost:
        rec = self._require(post_id)
        changes: dict = {}
        if approve.edited_caption is not None:
            changes["caption"] = approve.edited_caption
        if approve.scheduled_for is not None:
            changes["status"] = "scheduled"
            changes["scheduled_for"] = approve.scheduled_for
        elif rec["status"] == "draft":
            changes["status"] = "review"
        rec = self.repo.update(post_id, changes)
        return self._to_model(rec)

    def reject_post(self, post_id: str) -> AdminContentPost:
        rec = self._require(post_id)
        if rec["status"] != "published":
            rec = self.repo.update(post_id, {"status": "draft"})
        return self._to_model(rec)


def get_admin_content_service(
    repo: ContentRepository = Depends(get_content_repository),
) -> AdminContentService:
    return AdminContentService(repo)
```

Note: `repo.update(post_id, {})` with empty changes still bumps `updated_at` (in-memory) / no-op patch (Supabase returns the row); approve with neither edit nor time on a non-draft is a safe no-op.

In `api/app/services/__init__.py`, add:
```python
from .admin_content import AdminContentService, get_admin_content_service  # noqa: F401
from app.repositories import get_content_repository  # noqa: F401
```
and append `"get_admin_content_service"` and `"get_content_repository"` to `__all__`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_content_service.py -q`
Expected: PASS (8 passed).

- [ ] **Step 5: Commit**

```bash
git add api/app/services/admin_content.py api/app/services/__init__.py api/tests/test_admin_content_service.py
git commit -m "feat(api): AdminContentService + approve/reject transition rules"
```

---

## Task 6: API — /admin router (me + content) wired into the app

**Files:**
- Create: `api/app/routers/admin.py`
- Modify: `api/app/routers/__init__.py`, `api/app/main.py`
- Test: `api/tests/test_admin_router.py`

**Interfaces:**
- Consumes: `get_current_claims`, `require_admin`, `is_admin_email`, `get_admin_content_service`, admin models.
- Produces routes: `GET /admin/me`, `GET /admin/content/posts`, `POST /admin/content/posts`, `PATCH /admin/content/posts/{post_id}`, `POST /admin/content/posts/{post_id}/approve`, `POST /admin/content/posts/{post_id}/reject`. Content routes depend on `require_admin` (403 for non-admin).

- [ ] **Step 1: Write the failing test**

Create `api/tests/test_admin_router.py`:
```python
from fastapi.testclient import TestClient

from app.main import app
from app.middleware import get_current_claims
from app.services import get_admin_content_service
from app.services.admin_content import AdminContentService
from app.repositories.content_repository import InMemoryContentRepository


def _override(admin_email="admin@ex.com"):
    repo = InMemoryContentRepository()
    svc = AdminContentService(repo)
    app.dependency_overrides[get_current_claims] = lambda: {"sub": "u1", "email": admin_email}
    app.dependency_overrides[get_admin_content_service] = lambda: svc
    return svc


def teardown_function():
    app.dependency_overrides.clear()


def test_me_true_for_allowlisted(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("admin@ex.com")
    body = TestClient(app).get("/admin/me").json()
    assert body == {"admin": True, "email": "admin@ex.com"}


def test_me_false_for_non_admin(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("nobody@ex.com")
    body = TestClient(app).get("/admin/me").json()
    assert body == {"admin": False, "email": "nobody@ex.com"}


def test_content_crud_flow(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("admin@ex.com")
    c = TestClient(app)
    created = c.post("/admin/content/posts", json={"channel": "x", "caption": "hi"}).json()
    assert created["status"] == "draft"
    pid = created["id"]
    assert c.get("/admin/content/posts").json()["posts"][0]["id"] == pid
    edited = c.patch(f"/admin/content/posts/{pid}", json={"caption": "edited"}).json()
    assert edited["caption"] == "edited"
    approved = c.post(f"/admin/content/posts/{pid}/approve", json={}).json()
    assert approved["status"] == "review"
    rejected = c.post(f"/admin/content/posts/{pid}/reject").json()
    assert rejected["status"] == "draft"


def test_content_forbidden_for_non_admin(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("nobody@ex.com")
    assert TestClient(app).get("/admin/content/posts").status_code == 403
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_router.py -q`
Expected: FAIL (router not registered / 404).

- [ ] **Step 3: Implement the router**

Create `api/app/routers/admin.py`:
```python
import logging

from fastapi import APIRouter, Depends

from app.middleware import get_current_claims, require_admin
from app.models import (
    AdminContentApprove,
    AdminContentCreate,
    AdminContentPost,
    AdminContentUpdate,
    AdminMe,
)
from app.services import get_admin_content_service
from app.services.admin_access import is_admin_email
from app.services.admin_content import AdminContentService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/me", response_model=AdminMe)
async def admin_me(claims: dict = Depends(get_current_claims)) -> AdminMe:
    email = (claims.get("email") or "").strip().lower()
    return AdminMe(admin=is_admin_email(email), email=email)


@router.get("/content/posts")
async def list_posts(
    _admin: dict = Depends(require_admin),
    svc: AdminContentService = Depends(get_admin_content_service),
) -> dict:
    return {"posts": [p.model_dump() for p in svc.list_posts()]}


@router.post("/content/posts", response_model=AdminContentPost)
async def create_post(
    body: AdminContentCreate,
    _admin: dict = Depends(require_admin),
    svc: AdminContentService = Depends(get_admin_content_service),
) -> AdminContentPost:
    return svc.create_post(body)


@router.patch("/content/posts/{post_id}", response_model=AdminContentPost)
async def update_post(
    post_id: str,
    body: AdminContentUpdate,
    _admin: dict = Depends(require_admin),
    svc: AdminContentService = Depends(get_admin_content_service),
) -> AdminContentPost:
    return svc.update_post(post_id, body)


@router.post("/content/posts/{post_id}/approve", response_model=AdminContentPost)
async def approve_post(
    post_id: str,
    body: AdminContentApprove,
    _admin: dict = Depends(require_admin),
    svc: AdminContentService = Depends(get_admin_content_service),
) -> AdminContentPost:
    return svc.approve_post(post_id, body)


@router.post("/content/posts/{post_id}/reject", response_model=AdminContentPost)
async def reject_post(
    post_id: str,
    _admin: dict = Depends(require_admin),
    svc: AdminContentService = Depends(get_admin_content_service),
) -> AdminContentPost:
    return svc.reject_post(post_id)
```

In `api/app/routers/__init__.py`:
```python
from .admin import router as admin_router  # noqa: F401
```
and add `"admin_router"` to `__all__`.

In `api/app/main.py`, update the routers import and registration:
```python
from app.routers import health_router, profile_router, chat_router, admin_router
...
app.include_router(admin_router)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && .venv/bin/python -m pytest tests/test_admin_router.py -q`
Expected: PASS (4 passed).

- [ ] **Step 5: Run the full API suite (no regressions)**

Run: `cd api && .venv/bin/python -m pytest -q`
Expected: PASS (all green).

- [ ] **Step 6: Commit**

```bash
git add api/app/routers/admin.py api/app/routers/__init__.py api/app/main.py api/tests/test_admin_router.py
git commit -m "feat(api): /admin router (me + content endpoints, admin-gated)"
```

---

## Task 7: API — Supabase migration for admin_content_posts

**Files:**
- Create: `api/migrations/0002_admin_content_posts.sql`

**Interfaces:**
- Produces the `public.admin_content_posts` table the `SupabaseContentRepository` reads/writes. Columns match the `AdminContentPost` contract.

- [ ] **Step 1: Write the migration**

Create `api/migrations/0002_admin_content_posts.sql`:
```sql
-- Admin dashboard — Content & Social store (spec 2026-06-27-admin-dashboard).
-- Owned exclusively by the API via the service-role key. Isolated to Supabase
-- project arxcpgonhrhdpzhgwexj. No evogolf resources.
create table if not exists public.admin_content_posts (
    id            uuid primary key default gen_random_uuid(),
    channel       text not null check (channel in ('instagram','x','linkedin','facebook')),
    caption       text not null,
    hashtags      text[] not null default '{}',
    status        text not null default 'draft'
                  check (status in ('draft','review','scheduled','published')),
    scheduled_for timestamptz,
    source        text,
    ai            boolean not null default false,
    why_it_works  text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists admin_content_posts_status_idx
    on public.admin_content_posts (status, created_at desc);

-- RLS on; no anon/auth policies — only the service role (which bypasses RLS) touches it.
alter table public.admin_content_posts enable row level security;
```

- [ ] **Step 2: Verify it parses (dry syntax check)**

Run: `python -c "import pathlib; s=pathlib.Path('api/migrations/0002_admin_content_posts.sql').read_text(); assert 'admin_content_posts' in s and s.count('(')==s.count(')'); print('ok')"`
Expected: `ok`. (The live apply against Supabase happens in Task 16 deploy.)

- [ ] **Step 3: Commit**

```bash
git add api/migrations/0002_admin_content_posts.sql
git commit -m "feat(api): admin_content_posts migration"
```

---

## Task 8: Admin app scaffold (builds empty)

**Files:**
- Create: `admin/package.json`, `admin/next.config.ts`, `admin/tsconfig.json`, `admin/postcss.config.mjs`, `admin/eslint.config.mjs`, `admin/next-env.d.ts`, `admin/.gitignore`, `admin/vitest.config.ts`, `admin/app/layout.tsx`, `admin/app/globals.css`, `admin/app/page.tsx`

**Interfaces:**
- Produces a buildable Next.js app named `admin` (dev port 4100) with Tailwind v4, standalone output, Vitest configured, brand fonts/tokens, and a root page that redirects to `/content`.

- [ ] **Step 1: Copy config files verbatim from web**

```bash
cd /Volumes/Data/projects/ignitehealthnow
mkdir -p admin/app
cp web/next.config.ts admin/next.config.ts
cp web/tsconfig.json admin/tsconfig.json
cp web/postcss.config.mjs admin/postcss.config.mjs
cp web/eslint.config.mjs admin/eslint.config.mjs
cp web/next-env.d.ts admin/next-env.d.ts
cp web/app/globals.css admin/app/globals.css
cp web/app/layout.tsx admin/app/layout.tsx
printf 'node_modules\n.next\n*.tsbuildinfo\n.env*.local\n' > admin/.gitignore
```

- [ ] **Step 2: Write `admin/package.json`**

```json
{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 4100",
    "build": "next build",
    "start": "next start -p 4100",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.90.1",
    "next": "16.1.2",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Write `admin/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node', include: ['lib/**/*.test.ts'] },
})
```

- [ ] **Step 4: Write `admin/app/page.tsx`** (root → content)

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/content')
}
```

- [ ] **Step 5: Install and build**

```bash
cd admin && npm install && npm run build
```
Expected: install succeeds; `next build` completes (the `/` route compiles; `/content` 404s until Task 14 — that's fine, build still passes).

- [ ] **Step 6: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add admin/package.json admin/package-lock.json admin/next.config.ts admin/tsconfig.json admin/postcss.config.mjs admin/eslint.config.mjs admin/next-env.d.ts admin/.gitignore admin/vitest.config.ts admin/app
git commit -m "chore(admin): scaffold standalone next app"
```

---

## Task 9: Port shared libs, brand, advocate, and auth pages

**Files (create — verbatim copies + origin header):**
- `admin/lib/api/client.ts`, `admin/lib/auth/{client,server,middleware,types}.ts`, `admin/lib/supabase/{client,server}.ts`, `admin/proxy.ts`
- `admin/components/brand/BrandLogo.tsx`
- `admin/components/advocate/{AdvocateLauncher,AdvocatePanel,prompts,advocateMarkdown}.{ts,tsx}`
- `admin/components/auth/fields.tsx`, `admin/components/layout/AuthShell.tsx`
- `admin/app/login/page.tsx`, `admin/app/register/page.tsx`, `admin/app/forgot-password/page.tsx`, `admin/app/reset-password/page.tsx`, `admin/app/api/auth/signout/route.ts`

**Interfaces:**
- Produces in the admin app: `authClient` (`@/lib/auth/client`), `api` + types incl. `ChatMessage` (`@/lib/api/client`), `BrandLogo`/`BrandMark` (`@/components/brand/BrandLogo`), `AdvocateLauncher` (`@/components/advocate/AdvocateLauncher`), and working `/login` etc.

- [ ] **Step 1: Copy the files preserving relative paths**

```bash
cd /Volumes/Data/projects/ignitehealthnow
mkdir -p admin/lib/api admin/lib/auth admin/lib/supabase admin/components/brand admin/components/advocate admin/components/auth admin/components/layout admin/app/login admin/app/register admin/app/forgot-password admin/app/reset-password admin/app/api/auth/signout
cp web/lib/api/client.ts admin/lib/api/client.ts
cp web/lib/auth/client.ts admin/lib/auth/client.ts
cp web/lib/auth/server.ts admin/lib/auth/server.ts
cp web/lib/auth/middleware.ts admin/lib/auth/middleware.ts
cp web/lib/auth/types.ts admin/lib/auth/types.ts
cp web/lib/supabase/client.ts admin/lib/supabase/client.ts
cp web/lib/supabase/server.ts admin/lib/supabase/server.ts
cp web/proxy.ts admin/proxy.ts
cp web/components/brand/BrandLogo.tsx admin/components/brand/BrandLogo.tsx
cp web/components/advocate/AdvocateLauncher.tsx admin/components/advocate/AdvocateLauncher.tsx
cp web/components/advocate/AdvocatePanel.tsx admin/components/advocate/AdvocatePanel.tsx
cp web/components/advocate/prompts.ts admin/components/advocate/prompts.ts
cp web/components/advocate/advocateMarkdown.tsx admin/components/advocate/advocateMarkdown.tsx
cp web/components/auth/fields.tsx admin/components/auth/fields.tsx
cp web/components/layout/AuthShell.tsx admin/components/layout/AuthShell.tsx
cp web/app/login/page.tsx admin/app/login/page.tsx
cp web/app/register/page.tsx admin/app/register/page.tsx
cp web/app/forgot-password/page.tsx admin/app/forgot-password/page.tsx
cp web/app/reset-password/page.tsx admin/app/reset-password/page.tsx
cp web/app/api/auth/signout/route.ts admin/app/api/auth/signout/route.ts
```

- [ ] **Step 2: Add the origin header to each copied file**

Prepend (using `//` for `.ts`/`.tsx`) this exact line as the file's first line of each file copied in Step 1:
```
// Copied from web/<same-relative-path> — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
```
Place it above any `'use client'` directive — Next.js allows a leading comment before `'use client'`. Verify `'use client'` remains the first *statement* in client components.

- [ ] **Step 3: Adjust the proxy matcher for admin**

In `admin/proxy.ts`, change the `isProtected` check so admin routes are gated (the admin uses a `(admin)` route group whose URL paths are `/content`, etc.). Replace the `isProtected` block with:
```ts
  const p = request.nextUrl.pathname
  const isProtected =
    p === '/' ||
    p.startsWith('/content') ||
    p.startsWith('/today') ||
    p.startsWith('/overview') ||
    p.startsWith('/programs') ||
    p.startsWith('/members') ||
    p.startsWith('/reports') ||
    p.startsWith('/settings')
```

- [ ] **Step 4: Typecheck + lint + build**

```bash
cd admin && npx tsc --noEmit && npm run lint && npm run build
```
Expected: no type errors, lint clean, build succeeds (login/register/etc. routes compile).

- [ ] **Step 5: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add admin/lib admin/proxy.ts admin/components admin/app/login admin/app/register admin/app/forgot-password admin/app/reset-password admin/app/api
git commit -m "chore(admin): port shared libs, brand, advocate, auth pages from web"
```

---

## Task 10: Admin API client methods + content helpers (with Vitest)

**Files:**
- Modify: `admin/lib/api/client.ts`
- Create: `admin/lib/content/board.ts`, `admin/lib/content/board.test.ts`, `admin/lib/content/reducer.ts`, `admin/lib/content/reducer.test.ts`, `admin/lib/auth/adminGuard.ts`, `admin/lib/auth/adminGuard.test.ts`

**Interfaces:**
- Produces (admin `api` object additions): `getAdminMe(): Promise<AdminMe>`, `listContentPosts(): Promise<AdminContentPost[]>`, `createContentPost(body: AdminContentCreate): Promise<AdminContentPost>`, `updateContentPost(id, body: AdminContentUpdate): Promise<AdminContentPost>`, `approveContentPost(id, body: AdminContentApprove): Promise<AdminContentPost>`, `rejectContentPost(id): Promise<AdminContentPost>`. Types `AdminMe`, `AdminContentPost`, `AdminContentCreate`, `AdminContentUpdate`, `AdminContentApprove`, `Channel`, `Status`.
- Produces helpers: `COLUMNS: {status: Status; title: string}[]`, `groupByStatus(posts): Record<Status, AdminContentPost[]>`; reducer `contentReducer(state, action)` with actions `set|upsert|replace|remove`; `resolveAccess(me): 'ok' | 'denied'`.

- [ ] **Step 1: Write failing helper tests**

`admin/lib/content/board.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { groupByStatus, COLUMNS } from './board'
import type { AdminContentPost } from '@/lib/api/client'

const post = (id: string, status: AdminContentPost['status']): AdminContentPost => ({
  id, channel: 'x', caption: 'c', hashtags: [], status,
  scheduled_for: null, source: null, ai: false, why_it_works: null,
  created_at: '2026-06-27T00:00:00Z', updated_at: '2026-06-27T00:00:00Z',
})

describe('groupByStatus', () => {
  it('buckets posts into all four columns', () => {
    const g = groupByStatus([post('a', 'draft'), post('b', 'scheduled'), post('c', 'draft')])
    expect(g.draft.map((p) => p.id)).toEqual(['a', 'c'])
    expect(g.scheduled.map((p) => p.id)).toEqual(['b'])
    expect(g.review).toEqual([])
    expect(COLUMNS.map((c) => c.status)).toEqual(['draft', 'review', 'scheduled', 'published'])
  })
})
```

`admin/lib/content/reducer.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { contentReducer } from './reducer'
import type { AdminContentPost } from '@/lib/api/client'

const p = (id: string, caption = 'c'): AdminContentPost => ({
  id, channel: 'x', caption, hashtags: [], status: 'draft',
  scheduled_for: null, source: null, ai: false, why_it_works: null,
  created_at: '2026-06-27T00:00:00Z', updated_at: '2026-06-27T00:00:00Z',
})

describe('contentReducer', () => {
  it('set replaces all', () => {
    expect(contentReducer([], { type: 'set', posts: [p('a')] })).toHaveLength(1)
  })
  it('replace swaps by id, upsert adds when missing', () => {
    const s = contentReducer([p('a', 'old')], { type: 'replace', post: p('a', 'new') })
    expect(s[0].caption).toBe('new')
    expect(contentReducer(s, { type: 'upsert', post: p('b') })).toHaveLength(2)
  })
  it('remove drops by id', () => {
    expect(contentReducer([p('a'), p('b')], { type: 'remove', id: 'a' }).map((x) => x.id)).toEqual(['b'])
  })
})
```

`admin/lib/auth/adminGuard.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveAccess } from './adminGuard'

describe('resolveAccess', () => {
  it('ok only when admin', () => {
    expect(resolveAccess({ admin: true, email: 'a@x.com' })).toBe('ok')
    expect(resolveAccess({ admin: false, email: 'a@x.com' })).toBe('denied')
    expect(resolveAccess(null)).toBe('denied')
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd admin && npx vitest run`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement the helpers**

`admin/lib/content/board.ts`:
```ts
import type { AdminContentPost, Status } from '@/lib/api/client'

export const COLUMNS: { status: Status; title: string }[] = [
  { status: 'draft', title: 'Draft' },
  { status: 'review', title: 'In Review' },
  { status: 'scheduled', title: 'Scheduled' },
  { status: 'published', title: 'Published' },
]

export function groupByStatus(posts: AdminContentPost[]): Record<Status, AdminContentPost[]> {
  const out: Record<Status, AdminContentPost[]> = { draft: [], review: [], scheduled: [], published: [] }
  for (const p of posts) out[p.status].push(p)
  return out
}
```

`admin/lib/content/reducer.ts`:
```ts
import type { AdminContentPost } from '@/lib/api/client'

export type ContentAction =
  | { type: 'set'; posts: AdminContentPost[] }
  | { type: 'upsert'; post: AdminContentPost }
  | { type: 'replace'; post: AdminContentPost }
  | { type: 'remove'; id: string }

export function contentReducer(state: AdminContentPost[], action: ContentAction): AdminContentPost[] {
  switch (action.type) {
    case 'set':
      return action.posts
    case 'replace':
      return state.map((p) => (p.id === action.post.id ? action.post : p))
    case 'upsert':
      return state.some((p) => p.id === action.post.id)
        ? state.map((p) => (p.id === action.post.id ? action.post : p))
        : [action.post, ...state]
    case 'remove':
      return state.filter((p) => p.id !== action.id)
    default:
      return state
  }
}
```

`admin/lib/auth/adminGuard.ts`:
```ts
import type { AdminMe } from '@/lib/api/client'

export function resolveAccess(me: AdminMe | null): 'ok' | 'denied' {
  return me?.admin ? 'ok' : 'denied'
}
```

- [ ] **Step 4: Add API client methods + types**

Append to `admin/lib/api/client.ts` (after the existing `api` object's methods — add these as additional properties on the exported `api` object, and the types near the top with the other interfaces):
```ts
export type Channel = 'instagram' | 'x' | 'linkedin' | 'facebook'
export type Status = 'draft' | 'review' | 'scheduled' | 'published'

export interface AdminMe { admin: boolean; email: string }

export interface AdminContentPost {
  id: string
  channel: Channel
  caption: string
  hashtags: string[]
  status: Status
  scheduled_for: string | null
  source: string | null
  ai: boolean
  why_it_works: string | null
  created_at: string
  updated_at: string
}

export interface AdminContentCreate {
  channel: Channel
  caption: string
  hashtags?: string[]
  source?: string | null
  why_it_works?: string | null
  status?: Status
}

export interface AdminContentUpdate {
  channel?: Channel
  caption?: string
  hashtags?: string[]
  scheduled_for?: string | null
  source?: string | null
  why_it_works?: string | null
}

export interface AdminContentApprove {
  edited_caption?: string | null
  scheduled_for?: string | null
}
```
Then add these methods inside the `api` object (mirror the existing `chat` method's auth-header + fetch + error pattern):
```ts
  async getAdminMe(): Promise<AdminMe> {
    const res = await fetch(`${API_URL}/admin/me`, { headers: await getAuthHeaders() })
    if (!res.ok) throw new Error('Failed to load admin status')
    return res.json()
  },
  async listContentPosts(): Promise<AdminContentPost[]> {
    const res = await fetch(`${API_URL}/admin/content/posts`, { headers: await getAuthHeaders() })
    if (!res.ok) throw new Error('Failed to load posts')
    return (await res.json()).posts
  },
  async createContentPost(body: AdminContentCreate): Promise<AdminContentPost> {
    const res = await fetch(`${API_URL}/admin/content/posts`, {
      method: 'POST', headers: await getAuthHeaders(), body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Failed to create post')
    return res.json()
  },
  async updateContentPost(id: string, body: AdminContentUpdate): Promise<AdminContentPost> {
    const res = await fetch(`${API_URL}/admin/content/posts/${id}`, {
      method: 'PATCH', headers: await getAuthHeaders(), body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Failed to update post')
    return res.json()
  },
  async approveContentPost(id: string, body: AdminContentApprove): Promise<AdminContentPost> {
    const res = await fetch(`${API_URL}/admin/content/posts/${id}/approve`, {
      method: 'POST', headers: await getAuthHeaders(), body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Failed to approve post')
    return res.json()
  },
  async rejectContentPost(id: string): Promise<AdminContentPost> {
    const res = await fetch(`${API_URL}/admin/content/posts/${id}/reject`, {
      method: 'POST', headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to reject post')
    return res.json()
  },
```
Note: `getAuthHeaders()` already exists in the copied client and returns `{ Authorization, 'Content-Type' }`.

- [ ] **Step 5: Run tests + typecheck**

Run: `cd admin && npx vitest run && npx tsc --noEmit`
Expected: vitest PASS (3 files, all green); no type errors.

- [ ] **Step 6: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add admin/lib/api/client.ts admin/lib/content admin/lib/auth/adminGuard.ts admin/lib/auth/adminGuard.test.ts
git commit -m "feat(admin): api client admin methods + content/board/guard helpers + tests"
```

---

## Task 11: AdminShell + nav + header

**Files:**
- Create: `admin/components/layout/AdminShell.tsx`, `admin/components/layout/AdminSidebar.tsx`, `admin/components/layout/AdminHeader.tsx`

**Interfaces:**
- Consumes: `BrandLogo` (`@/components/brand/BrandLogo`), `AdvocateLauncher` (`@/components/advocate/AdvocateLauncher`).
- Produces: `AdminShell({ children, email })` — sidebar + header chrome that mounts `AdvocateLauncher`. `AdminSidebar` nav items: Content & Social (`/content`, active), and disabled "Soon" items Today/Overview/Programs/Members/Reports/Settings.

- [ ] **Step 1: Implement `AdminSidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'

const NAV = [
  { label: 'Content & Social', href: '/content', enabled: true },
  { label: 'Today', href: '/today', enabled: false },
  { label: 'Overview', href: '/overview', enabled: false },
  { label: 'Programs', href: '/programs', enabled: false },
  { label: 'Members', href: '/members', enabled: false },
  { label: 'Reports', href: '/reports', enabled: false },
  { label: 'Settings', href: '/settings', enabled: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center border-b border-line px-5">
        <BrandLogo size={32} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="kicker px-3 pb-2">Marketing Ops</p>
        <div className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'
            if (!item.enabled) {
              return (
                <div key={item.label} className={`${base} cursor-not-allowed text-faint`}>
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full bg-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">Soon</span>
                </div>
              )
            }
            return (
              <Link key={item.label} href={item.href}
                className={`${base} ${active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-page hover:text-brand-ink'}`}>
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Implement `AdminHeader.tsx`**

```tsx
const KICKERS: Record<string, { kicker: string; title: string }> = {
  '/content': { kicker: 'Marketing', title: 'Content & Social' },
}

export default function AdminHeader({ pathname, email }: { pathname: string; email: string }) {
  const meta = KICKERS[pathname] ?? { kicker: 'Admin', title: 'Admin' }
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <div>
        <p className="kicker">{meta.kicker}</p>
        <h1 className="text-lg font-semibold text-brand-ink">{meta.title}</h1>
      </div>
      <span className="text-sm text-muted">{email}</span>
    </header>
  )
}
```

- [ ] **Step 3: Implement `AdminShell.tsx`**

```tsx
'use client'

import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdvocateLauncher from '@/components/advocate/AdvocateLauncher'

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-page text-body">
      <AdminSidebar />
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <AdminHeader pathname={pathname} email={email} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
      <AdvocateLauncher />
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `cd admin && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add admin/components/layout/AdminShell.tsx admin/components/layout/AdminSidebar.tsx admin/components/layout/AdminHeader.tsx
git commit -m "feat(admin): AdminShell + sidebar + header"
```

---

## Task 12: Admin (admin) layout with access gate + no-access + coming-soon

**Files:**
- Create: `admin/app/(admin)/layout.tsx`, `admin/app/no-access/page.tsx`, `admin/app/(admin)/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getServerSession` (`@/lib/auth/server`), `resolveAccess` (`@/lib/auth/adminGuard`), `AdminShell`. Calls `GET /admin/me` server-side with the session token.
- Produces: the gated `(admin)` layout used by `/content` and the coming-soon `[slug]` routes; redirects unauthed → `/login`, non-admin → `/no-access`.

- [ ] **Step 1: Implement the gated layout**

`admin/app/(admin)/layout.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/server'
import { resolveAccess } from '@/lib/auth/adminGuard'
import AdminShell from '@/components/layout/AdminShell'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerSession()
  if (!auth) redirect('/login')

  let me: { admin: boolean; email: string } | null = null
  try {
    const res = await fetch(`${API_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    })
    if (res.ok) me = await res.json()
  } catch {
    me = null
  }

  if (resolveAccess(me) === 'denied') redirect('/no-access')

  return <AdminShell email={me!.email}>{children}</AdminShell>
}
```
Confirm `getServerSession()` returns `{ token, userId }` (it does in the copied `web/lib/auth/server.ts` — the same shape `web/app/(app)/layout.tsx` uses).

- [ ] **Step 2: Implement the no-access page**

`admin/app/no-access/page.tsx`:
```tsx
import Link from 'next/link'

export default function NoAccess() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center">
      <h1 className="text-xl font-semibold text-brand-ink">No admin access</h1>
      <p className="max-w-sm text-sm text-muted">
        This account isn’t on the admin allowlist. If that’s a mistake, ask an existing admin to add you.
      </p>
      <form action="/api/auth/signout" method="post">
        <button className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted hover:bg-surface">
          Sign out
        </button>
      </form>
      <Link href="/login" className="text-sm text-accent">Back to sign in</Link>
    </main>
  )
}
```

- [ ] **Step 3: Implement the coming-soon catch-all**

`admin/app/(admin)/[slug]/page.tsx`:
```tsx
export default async function ComingSoon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = slug.charAt(0).toUpperCase() + slug.slice(1)
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">This admin module is coming in a later slice.</p>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck + build**

Run: `cd admin && npx tsc --noEmit && npm run build`
Expected: compiles. (`/content` still 404 until Task 13; the `[slug]` route handles `/today` etc.)

- [ ] **Step 5: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add "admin/app/(admin)/layout.tsx" admin/app/no-access "admin/app/(admin)/[slug]"
git commit -m "feat(admin): gated (admin) layout + no-access + coming-soon"
```

---

## Task 13: Content & Social board + composer (live)

**Files:**
- Create: `admin/app/(admin)/content/page.tsx`, `admin/components/content/ContentBoard.tsx`, `admin/components/content/ContentColumn.tsx`, `admin/components/content/ContentCard.tsx`, `admin/components/content/ContentComposer.tsx`

**Interfaces:**
- Consumes: `api.*` content methods, `COLUMNS`/`groupByStatus` (`@/lib/content/board`), `contentReducer` (`@/lib/content/reducer`), types from `@/lib/api/client`.
- Produces: `/content` route rendering the live board with create/edit/approve/reject and optimistic updates + rollback.

- [ ] **Step 1: Implement the page (server shell)**

`admin/app/(admin)/content/page.tsx`:
```tsx
import ContentBoard from '@/components/content/ContentBoard'

export default function ContentPage() {
  return <ContentBoard />
}
```

- [ ] **Step 2: Implement `ContentBoard.tsx`** (client; data + optimistic actions)

```tsx
'use client'

import { useEffect, useReducer, useState } from 'react'
import { api, type AdminContentPost, type AdminContentCreate, type AdminContentUpdate } from '@/lib/api/client'
import { COLUMNS, groupByStatus } from '@/lib/content/board'
import { contentReducer } from '@/lib/content/reducer'
import ContentColumn from './ContentColumn'
import ContentComposer from './ContentComposer'

export default function ContentBoard() {
  const [posts, dispatch] = useReducer(contentReducer, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<AdminContentPost | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.listContentPosts()
      .then((p) => dispatch({ type: 'set', posts: p }))
      .catch(() => setError('Could not load posts.'))
      .finally(() => setLoading(false))
  }, [])

  // Optimistic helper: apply locally, call API, replace with server row, rollback on error.
  const optimistic = async (
    prev: AdminContentPost,
    next: AdminContentPost,
    call: () => Promise<AdminContentPost>,
  ) => {
    setError('')
    dispatch({ type: 'replace', post: next })
    try {
      dispatch({ type: 'replace', post: await call() })
    } catch {
      dispatch({ type: 'replace', post: prev })
      setError('That change didn’t save. Please retry.')
    }
  }

  const approve = (p: AdminContentPost, scheduledFor: string | null) =>
    optimistic(
      p,
      { ...p, status: scheduledFor ? 'scheduled' : p.status === 'draft' ? 'review' : p.status, scheduled_for: scheduledFor ?? p.scheduled_for },
      () => api.approveContentPost(p.id, { scheduled_for: scheduledFor }),
    )

  const reject = (p: AdminContentPost) =>
    optimistic(p, { ...p, status: 'draft' }, () => api.rejectContentPost(p.id))

  const saveEdit = async (id: string, body: AdminContentUpdate) => {
    const prev = posts.find((p) => p.id === id)!
    await optimistic(prev, { ...prev, ...body } as AdminContentPost, () => api.updateContentPost(id, body))
    setEditing(null)
  }

  const create = async (body: AdminContentCreate) => {
    setError('')
    try {
      dispatch({ type: 'upsert', post: await api.createContentPost(body) })
      setCreating(false)
    } catch {
      setError('Could not create the post.')
    }
  }

  const grouped = groupByStatus(posts)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{posts.length} posts</p>
        <button onClick={() => setCreating(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover">
          New post
        </button>
      </div>
      {error && <p className="mb-3 rounded-lg bg-[#FBEFEC] px-3 py-2 text-sm text-[#C8553D]">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <ContentColumn
              key={col.status}
              title={col.title}
              posts={grouped[col.status]}
              onApprove={approve}
              onReject={reject}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}
      {(creating || editing) && (
        <ContentComposer
          post={editing}
          onClose={() => { setCreating(false); setEditing(null) }}
          onCreate={create}
          onSave={saveEdit}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement `ContentColumn.tsx` + `ContentCard.tsx`**

`admin/components/content/ContentColumn.tsx`:
```tsx
import type { AdminContentPost } from '@/lib/api/client'
import ContentCard from './ContentCard'

export default function ContentColumn({
  title, posts, onApprove, onReject, onEdit,
}: {
  title: string
  posts: AdminContentPost[]
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  return (
    <div className="rounded-2xl bg-[#eef3f6] p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-sm font-semibold text-[#3c4f59]">{title}</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{posts.length}</span>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <ContentCard key={p.id} post={p} onApprove={onApprove} onReject={onReject} onEdit={onEdit} />
        ))}
        {posts.length === 0 && <p className="px-1 py-6 text-center text-xs text-faint">Nothing here yet</p>}
      </div>
    </div>
  )
}
```

`admin/components/content/ContentCard.tsx`:
```tsx
import type { AdminContentPost } from '@/lib/api/client'

export default function ContentCard({
  post, onApprove, onReject, onEdit,
}: {
  post: AdminContentPost
  onApprove: (p: AdminContentPost, scheduledFor: string | null) => void
  onReject: (p: AdminContentPost) => void
  onEdit: (p: AdminContentPost) => void
}) {
  const canApprove = post.status === 'draft' || post.status === 'review'
  const canReject = post.status !== 'published' && post.status !== 'draft'
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">{post.channel}</span>
        {post.scheduled_for && (
          <span className="text-[11px] text-faint">{new Date(post.scheduled_for).toLocaleString()}</span>
        )}
      </div>
      <p className="mb-3 text-sm text-[#2b3d47]">{post.caption}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onEdit(post)} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted hover:bg-page">Edit</button>
        {canApprove && (
          <button onClick={() => onApprove(post, null)} className="rounded-md bg-brand-now px-2.5 py-1 text-xs font-semibold text-white hover:brightness-95">Approve</button>
        )}
        {canReject && (
          <button onClick={() => onReject(post)} className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-[#C8553D] hover:bg-page">Reject</button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `ContentComposer.tsx`** (create + edit slide-over)

```tsx
'use client'

import { useState } from 'react'
import type { AdminContentPost, AdminContentCreate, AdminContentUpdate, Channel } from '@/lib/api/client'

const CHANNELS: Channel[] = ['instagram', 'x', 'linkedin', 'facebook']

export default function ContentComposer({
  post, onClose, onCreate, onSave,
}: {
  post: AdminContentPost | null
  onClose: () => void
  onCreate: (body: AdminContentCreate) => void
  onSave: (id: string, body: AdminContentUpdate) => void
}) {
  const [channel, setChannel] = useState<Channel>(post?.channel ?? 'instagram')
  const [caption, setCaption] = useState(post?.caption ?? '')
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for ? post.scheduled_for.slice(0, 16) : '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const iso = scheduledFor ? new Date(scheduledFor).toISOString() : null
    if (post) onSave(post.id, { channel, caption, scheduled_for: iso })
    else onCreate({ channel, caption })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-brand-ink/30" onClick={onClose} aria-hidden />
      <form onSubmit={submit} className="relative flex h-full w-[420px] max-w-[92vw] flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold text-brand-ink">{post ? 'Edit post' : 'New post'}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-brand-ink">✕</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">Channel</label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button key={c} type="button" onClick={() => setChannel(c)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${channel === c ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">Caption</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} required
              className="min-h-[120px] w-full rounded-lg border border-line bg-white p-3 text-sm text-[#2b3d47] focus:border-accent focus:outline-none" />
          </div>
          {post && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted">Schedule (optional)</label>
              <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full rounded-lg border border-line bg-white p-2 text-sm text-[#2b3d47] focus:border-accent focus:outline-none" />
              <p className="mt-1 text-[11px] text-faint">Setting a time schedules the post on save.</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-line px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-line py-2 text-sm font-semibold text-muted hover:bg-page">Cancel</button>
          <button type="submit" disabled={!caption.trim()} className="flex-[1.6] rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50">
            {post ? 'Save changes' : 'Create draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
```
Note: editing with a `scheduled_for` saves via `PATCH` (sets the time); the card's **Approve** action transitions status. This keeps the composer's "save" and the card's "approve" responsibilities distinct (matches the spec's transition endpoints).

- [ ] **Step 5: Typecheck + build + unit tests**

Run: `cd admin && npx tsc --noEmit && npx vitest run && npm run build`
Expected: no type errors, vitest green, build succeeds with the `/content` route present.

- [ ] **Step 6: Commit**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add "admin/app/(admin)/content" admin/components/content
git commit -m "feat(admin): live Content & Social board + composer"
```

---

## Task 14: Admin Dockerfile, Cloud Build, and guarded deploy script

**Files:**
- Create: `admin/Dockerfile`, `admin/cloudbuild.admin.yaml`, `admin/.env.development.local` (gitignored), `infra/scripts/deploy_admin.py`

**Interfaces:**
- Produces the container build + a deploy script that bakes `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com` and the Supabase config, **aborting if the Supabase project ≠ `arxcpgonhrhdpzhgwexj`**.

- [ ] **Step 1: Copy the Dockerfile + cloudbuild, retarget image**

```bash
cd /Volumes/Data/projects/ignitehealthnow
cp web/Dockerfile admin/Dockerfile
sed 's/ignitehealth-web/ignitehealth-admin/g' web/cloudbuild.web.yaml > admin/cloudbuild.admin.yaml
```
Verify `admin/cloudbuild.admin.yaml` now references `ignitehealth-admin:latest` in both the `-t` arg and `images:`.

- [ ] **Step 2: Create the gitignored env file**

Create `admin/.env.development.local` (NOT committed — covered by `admin/.gitignore`'s `.env*.local`). Use the **same** Supabase URL + anon key as `web/.env.development.local` (read that file with the Read tool; do not echo secrets to the shell):
```
NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com
NEXT_PUBLIC_SUPABASE_URL=https://arxcpgonhrhdpzhgwexj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<copy from web/.env.development.local>
```

- [ ] **Step 3: Write `infra/scripts/deploy_admin.py`**

```python
#!/usr/bin/env python3
"""Build + deploy the admin app to Cloud Run. Reads admin/.env.development.local
internally (no secrets printed). ABORTS if the resolved Supabase project isn't
arxcpgonhrhdpzhgwexj. Bakes the production API domain."""
import os, re, subprocess, sys

ROOT = "/Volumes/Data/projects/ignitehealthnow"
P = "ignitehealthnow-2025"
R = "us-central1"
REPO = f"us-central1-docker.pkg.dev/{P}/ignitehealth"
API = "https://api.ignitehealthnow.com"
EXPECTED_SUPA_PROJECT = "arxcpgonhrhdpzhgwexj"


def read_env(path):
    out = {}
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                m = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
                if m:
                    out[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return out


env = read_env(f"{ROOT}/admin/.env.development.local")
SUPA_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPA_ANON = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
if not SUPA_URL or not SUPA_ANON:
    sys.exit("ABORT: missing NEXT_PUBLIC_SUPABASE_* in admin/.env.development.local")
proj = SUPA_URL.split("//")[-1].split(".")[0]
if proj != EXPECTED_SUPA_PROJECT:
    sys.exit(f"ABORT: Supabase project '{proj}' != expected '{EXPECTED_SUPA_PROJECT}'")

print(f"[admin] API={API} SUPA={proj} (anon {len(SUPA_ANON)} chars)")
subprocess.run(
    ["gcloud", "builds", "submit", "admin", "--project", P,
     "--substitutions", f"_API={API},_SUPA_URL={SUPA_URL},_SUPA_ANON={SUPA_ANON}",
     "--config", "admin/cloudbuild.admin.yaml"],
    check=True, cwd=ROOT,
)
subprocess.run(
    ["gcloud", "run", "deploy", "ignitehealth-admin",
     "--image", f"{REPO}/ignitehealth-admin:latest", "--region", R, "--project", P,
     "--allow-unauthenticated"],
    check=True, cwd=ROOT,
)
url = subprocess.check_output(
    ["gcloud", "run", "services", "describe", "ignitehealth-admin",
     "--region", R, "--project", P, "--format=value(status.url)"], cwd=ROOT,
).decode().strip()
print(f"[admin] DONE url={url}")
```

- [ ] **Step 4: Verify the abort guard works (no real deploy yet)**

Run: `python3 -c "import subprocess,sys; print('guard present:', 'EXPECTED_SUPA_PROJECT' in open('infra/scripts/deploy_admin.py').read())"`
Expected: `guard present: True`. (A full build/deploy happens in Task 16.)

- [ ] **Step 5: Commit (script + docker only — never the env file)**

```bash
cd /Volumes/Data/projects/ignitehealthnow
git add admin/Dockerfile admin/cloudbuild.admin.yaml infra/scripts/deploy_admin.py
git status --short   # confirm admin/.env.development.local is NOT staged
git commit -m "chore(admin): Dockerfile, cloudbuild, guarded deploy script"
```

---

## Task 15: Local end-to-end verification (API + admin)

**Files:** none (verification task).

**Interfaces:** Consumes everything built. Confirms the slice works locally before cloud deploy.

- [ ] **Step 1: Run the full API test suite**

Run: `cd api && .venv/bin/python -m pytest -q`
Expected: all pass (chat/profile/health + the 3 new admin test files).

- [ ] **Step 2: Run the admin unit tests + typecheck + lint + build**

Run: `cd admin && npx vitest run && npx tsc --noEmit && npm run lint && npm run build`
Expected: vitest green; no type errors; lint clean; build succeeds.

- [ ] **Step 3: Boot the API locally and smoke `/admin/me` (non-admin path needs no allowlist)**

Run the API per `api/README.md` (outside the sandbox, as the project requires), then with a valid Supabase access token for a non-allowlisted user:
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/admin/me
```
Expected: `{"admin":false,"email":"<that user>"}` (200). With `ADMIN_EMAILS` set to that email and the API restarted, expect `{"admin":true,...}`.

- [ ] **Step 4: Commit (if any verification fixes were needed)**

```bash
git commit -am "test: local e2e verification fixes for admin slice" || echo "nothing to commit"
```

---

## Task 16: Cloud deploy + domain + CORS + migration

**Files:** none in repo (infra actions); records outcomes in the journal at the end.

**Interfaces:** Consumes the deploy script, the migration SQL, and the API admin router. Produces a live admin service.

- [ ] **Step 1: Apply the Supabase migration to project `arxcpgonhrhdpzhgwexj`**

Apply `api/migrations/0002_admin_content_posts.sql` via the Supabase SQL editor / `psql` against the **`arxcpgonhrhdpzhgwexj`** project (never any other project). Verify the table exists:
```sql
select count(*) from public.admin_content_posts;
```
Expected: `0`.

- [ ] **Step 2: Redeploy the API with `ADMIN_EMAILS` (MERGE env — never replace)**

```bash
gcloud run services update ignitehealth-api --region us-central1 --project ignitehealthnow-2025 \
  --update-env-vars "ADMIN_EMAILS=patrick.ty@ignitedigitallabs.com"
```
(Then rebuild+redeploy the API image so the new `/admin` router ships — follow the existing API deploy path in `infra/scripts/`/journal. Confirm `https://api.ignitehealthnow.com/admin/me` returns 401 without a token, not 404.)

- [ ] **Step 3: Build + deploy the admin app**

```bash
python3 infra/scripts/deploy_admin.py
```
Expected: prints `[admin] DONE url=https://ignitehealth-admin-…run.app`.

- [ ] **Step 4: Map the custom domain**

```bash
gcloud beta run domain-mappings create --service ignitehealth-admin \
  --domain admin.ignitehealthnow.com --region us-central1 --project ignitehealthnow-2025
```
Expected: mapping created (cert provisions over minutes; the `admin` CNAME → `ghs.googlehosted.com.` is pre-staged).

- [ ] **Step 5: Add the admin origin to API CORS (MERGE)**

```bash
gcloud run services update ignitehealth-api --region us-central1 --project ignitehealthnow-2025 \
  --update-env-vars '^@^CORS_ORIGINS=["https://app.ignitehealthnow.com","https://admin.ignitehealthnow.com","https://ignitehealth-web-h6nxnovkfa-uc.a.run.app"]'
```
(Use the current full origin list — read it first with `gcloud run services describe ignitehealth-api ... --format='value(spec.template.spec.containers[0].env)'` and add the admin origin. Never `--set-env-vars`.)

- [ ] **Step 6: Verify live**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://ignitehealth-admin-h6nxnovkfa-uc.a.run.app/login   # 200
curl -s -o /dev/null -w "%{http_code}\n" https://api.ignitehealthnow.com/admin/me                     # 401 (no token)
```
Then via Playwright MCP, run the happy-path smoke: open the admin run.app `/login`, sign in as an allowlisted admin, confirm redirect to `/content`, create a post (appears in Draft), Approve it (moves to In Review), and confirm a non-admin sign-in lands on `/no-access`. Capture a screenshot of `/content`.

- [ ] **Step 7: Journal the deploy**

Append a short section to `docs/journals/` (new dated file) recording: admin revision + URL, the `admin_content_posts` migration applied to `arxcpgonhrhdpzhgwexj`, `ADMIN_EMAILS` value set, CORS origins after the merge, domain-mapping status, and any follow-ups. Commit it.

---

## Self-Review

**1. Spec coverage:**
- Repo layout / separate app + copied modules → Tasks 8, 9. ✓
- Brand origin-noting + packages/ui follow-up → Task 9 Step 2 + Global Constraints. ✓
- Guarded build (Supabase project assertion) → Task 14. ✓
- Access gate (`ADMIN_EMAILS`, `/admin/me`, own login, server-layout redirect, 403 on content) → Tasks 1, 2, 6, 12. ✓
- `AdminContentPost` contract + endpoints + `ContentRepository` + Supabase table → Tasks 3, 4, 5, 6, 7. ✓
- Channels limited to instagram/x/linkedin/facebook; email/blog + publish deferred → models (Task 3), no publish action (Task 13). ✓
- Kanban + composer + optimistic rollback → Task 13. ✓
- Embedded Advocate (ported, PHI rule) → Task 9 (copy) + Task 11 (mount). ✓
- Deploy/CORS/domain → Tasks 14, 16. ✓
- Testing (API allowlist + content + mapper/transitions; admin pure helpers + Playwright smoke) → Tasks 1–6, 10, 13, 15, 16. ✓
- Isolation / agents untouched → Global Constraints; no task touches `cloud_functions/`. ✓

**2. Placeholder scan:** No "TBD/handle later/etc." Every code step contains complete code; the only `<…>` placeholders are the deliberate secret value in `admin/.env.development.local` (read from `web/.env.development.local`) and the origin-header path token — both explicitly instructed. ✓

**3. Type consistency:** `AdminContentPost` fields identical across API model (Task 3), repo dict (Task 4), and TS interface (Task 10). Method names (`approveContentPost`, `rejectContentPost`, `updateContentPost`, `listContentPosts`, `createContentPost`, `getAdminMe`) consistent between Task 10 (client) and Task 13 (board). Transition rules identical between API service (Task 5) and the optimistic preview (Task 13). `resolveAccess`/`groupByStatus`/`contentReducer` signatures match between definition (Task 10) and use (Tasks 12, 13). ✓
