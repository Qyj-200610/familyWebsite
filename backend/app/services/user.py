from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import RegisterRequest, UpdateUserRequest


class UserService:
    """Business logic for user and auth operations."""

    @staticmethod
    async def create_user(db: AsyncSession, data: RegisterRequest) -> tuple[User, str]:
        """Create a new user and return it with a JWT token."""
        # Check email uniqueness
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise ValueError("EMAIL_EXISTS")

        # Check username uniqueness
        result = await db.execute(select(User).where(User.username == data.username))
        if result.scalar_one_or_none():
            raise ValueError("USERNAME_TAKEN")

        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        token = create_access_token({"sub": str(user.id)})
        return user, token

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> tuple[User, str] | None:
        """Authenticate a user by email and password. Returns (user, token) or None."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            return None

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

        await db.flush()
        await db.refresh(user)
        return user
