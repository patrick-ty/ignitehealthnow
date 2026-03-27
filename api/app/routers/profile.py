import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware import get_current_user_id
from app.models import ProfileResponse, ProfileUpdate, PropertyUpdate
from app.services import get_profile_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    profile_service=Depends(get_profile_service),
):
    """
    Get current user's profile.
    Bootstraps profile if it doesn't exist (idempotent).
    Story 00.6 & 00.7 from UC 00.3
    """
    try:
        profile = await profile_service.get_profile(user_id)
        if not profile:
            await profile_service.bootstrap_profile(user_id)
            profile = await profile_service.get_profile(user_id)
            if not profile:
                return ProfileResponse(
                    user_id=user_id,
                    first_name=None,
                    last_name=None,
                    mobile=None,
                    zipcode=None,
                    birth_year=None,
                    display_name=None,
                    avatar_url=None,
                    handle=None,
                    email=None,
                    is_complete=False,
                    created_at=None,
                    updated_at=None,
                )

        return ProfileResponse(
            **profile,
            is_complete=profile_service._is_profile_complete(profile),
        )

    except Exception as e:
        logger.error(f"Failed to get profile for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile",
        )


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    profile_service=Depends(get_profile_service),
):
    """
    Update current user's profile.
    Auto-generates handle and display_name on completion.
    Story 00.7 from UC 00.3
    """
    try:
        # Update profile
        await profile_service.update_profile(user_id, profile_update)

        # Return with completeness check
        profile = await profile_service.get_profile_with_completeness(user_id)

        return profile

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update profile for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )


@router.put("/properties/{key}", status_code=status.HTTP_200_OK)
async def set_profile_property(
    key: str,
    property_update: PropertyUpdate,
    user_id: str = Depends(get_current_user_id),
    profile_service=Depends(get_profile_service),
):
    """
    Set a profile property (key-value extension).
    Story 00.8 from UC 00.3
    """
    try:
        await profile_service.set_property(user_id, key, property_update.value_json)
        return {"key": key, "value_json": property_update.value_json}

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to set property {key} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set property",
        )


@router.delete("/properties/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile_property(
    key: str,
    user_id: str = Depends(get_current_user_id),
    profile_service=Depends(get_profile_service),
):
    """
    Delete a profile property.
    Story 00.8 from UC 00.3
    """
    try:
        await profile_service.delete_property(user_id, key)
        return None

    except Exception as e:
        logger.error(f"Failed to delete property {key} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete property",
        )
