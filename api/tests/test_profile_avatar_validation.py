from fastapi.testclient import TestClient

from app.main import app
from app.middleware import get_current_user_id
from app.models import ProfileResponse
from app.services import get_profile_service


class FakeProfileService:
    async def update_profile(self, user_id, profile_update):
        return {
            "user_id": user_id,
            "avatar_url": profile_update.avatar_url,
        }

    async def get_profile_with_completeness(self, user_id):
        return ProfileResponse(
            user_id=user_id,
            is_complete=False,
            avatar_url="/avatars/system/avatar-3.png",
        )


def test_avatar_url_valid():
    app.dependency_overrides[get_current_user_id] = lambda: "user-1"
    app.dependency_overrides[get_profile_service] = lambda: FakeProfileService()
    client = TestClient(app)

    response = client.patch(
        "/profile", json={"avatar_url": "/avatars/system/avatar-3.png"}
    )
    assert response.status_code == 200
    assert response.json()["avatar_url"] == "/avatars/system/avatar-3.png"

    app.dependency_overrides = {}


def test_avatar_url_invalid():
    app.dependency_overrides[get_current_user_id] = lambda: "user-1"
    app.dependency_overrides[get_profile_service] = lambda: FakeProfileService()
    client = TestClient(app)

    response = client.patch(
        "/profile", json={"avatar_url": "/avatars/system/avatar-99.png"}
    )
    assert response.status_code == 422

    app.dependency_overrides = {}
