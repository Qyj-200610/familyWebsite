from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.user import User
from app.schemas.user import UpdateUserRequest, UserResponse
from app.services.user import UserService

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return success_response(UserResponse.model_validate(current_user).model_dump(mode="json"))


@router.patch("/me")
async def update_me(
    data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile."""
    try:
        user = await UserService.update_user(db, current_user, data)
        return success_response(UserResponse.model_validate(user).model_dump(mode="json"))
    except ValueError as e:
        error_map = {
            "USERNAME_TAKEN": (2002, "用户名已被占用"),
        }
        code, msg = error_map.get(str(e), (2000, "更新失败"))
        return error_response(code, msg)
