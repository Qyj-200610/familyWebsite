from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import RegisterRequest, UpdateUserRequest


class UserService:
    """Business logic for user and auth operations."""

    @staticmethod
    async def create_user(db: AsyncSession, data: RegisterRequest) -> User:
        """Create a new user and return it."""
        # Best-effort fast-path uniqueness check
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise ValueError("EMAIL_EXISTS")

        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise ValueError("USERNAME_TAKEN")

        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        db.add(user)
        try:
            await db.flush()
        except IntegrityError as e:
            await db.rollback()
            err_msg = str(e.orig).lower() if e.orig else ""
            if "email" in err_msg:
                raise ValueError("EMAIL_EXISTS") from e
            if "username" in err_msg:
                raise ValueError("USERNAME_TAKEN") from e
            raise
        await db.refresh(user)

        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> tuple[User, str] | None:
        """Authenticate a user by email and password. Returns (user, token) or None."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            return None

        # 记录最后登录时间
        user.last_login = datetime.now(timezone.utc)
        await db.flush()

        token = create_access_token({"sub": str(user.id)})
        return user, token

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
        """Get a user by their primary key."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_user(db: AsyncSession, user: User, data: UpdateUserRequest) -> User:
        """Update user profile fields."""
        if data.username is not None:
            # Check username uniqueness (excluding self)
            result = await db.execute(
                select(User).where(User.username == data.username, User.id != user.id)
            )
            if result.scalar_one_or_none():
                raise ValueError("USERNAME_TAKEN")
            user.username = data.username

        if data.avatar is not None:
            user.avatar = data.avatar

        try:
            await db.flush()
        except IntegrityError as e:
            await db.rollback()
            err_msg = str(e.orig).lower() if e.orig else ""
            if "username" in err_msg:
                raise ValueError("USERNAME_TAKEN") from e
            raise
        await db.refresh(user)
        return user

    # ── Password Reset ────────────────────────────────────────

    @staticmethod
    async def reset_password(db: AsyncSession, email: str, new_password: str) -> None:
        """Reset a user's password by email.

        Raises:
            ValueError: USER_NOT_FOUND if the email is not registered.
        """
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("USER_NOT_FOUND")

        user.hashed_password = hash_password(new_password)
        await db.flush()
