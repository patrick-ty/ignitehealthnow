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
