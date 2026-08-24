from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.user import UserService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all registered users (admin only)."""
    users = await UserService.get_all_users(db)
    data = [
        UserResponse.model_validate(u).model_dump(mode="json", by_alias=True)
        for u in users
    ]
    return success_response(data)
