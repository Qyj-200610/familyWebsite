from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.user import UserService

security_scheme = HTTPBearer(auto_error=False)


async def _resolve_user_from_token(
    db: AsyncSession,
    credentials: HTTPAuthorizationCredentials | None,
) -> User | None:
    """Decode the bearer token and load the matching user.

    Returns ``None`` for any failure (missing credentials, invalid/expired
    token, malformed ``sub`` claim, or unknown user).  Callers decide how to
    surface that failure (raise 401 vs. treat as anonymous).
    """
    if credentials is None:
        return None

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None

    user_id = payload.get("sub")
    if user_id is None:
        return None

    try:
        return await UserService.get_user_by_id(db, int(user_id))
    except (ValueError, TypeError):
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Dependency that extracts and validates the current user from the Bearer token.

    Raises HTTPException(401) if token is missing, invalid, expired, or user not found.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="请先登录")

    user = await _resolve_user_from_token(db, credentials)
    if user is None:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Like ``get_current_user``, but returns ``None`` instead of raising 401.

    Use this for endpoints where authentication is optional (e.g. family status).
    """
    return await _resolve_user_from_token(db, credentials)


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to be the configured administrator.

    Raises HTTPException(403) for any authenticated user whose email does not
    match ``settings.ADMIN_EMAIL``.
    """
    if current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="无管理员权限")
    return current_user
