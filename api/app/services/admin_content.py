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
