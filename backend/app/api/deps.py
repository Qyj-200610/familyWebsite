from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.services.user import UserService

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Dependency that extracts and validates the current user from the Bearer token.

    Raises HTTPException(401) if token is missing, invalid, expired, or user not found.
    """
    from fastapi import HTTPException

    if credentials is None:
        raise HTTPException(status_code=401, detail="请先登录")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token 格式错误")

    user = await UserService.get_user_by_id(db, int(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user
