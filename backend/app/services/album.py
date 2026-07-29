from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.album import Album
from app.models.user import User


class AlbumService:
    """Business logic for album operations."""

    @staticmethod
    async def create_album(
        db: AsyncSession,
        user: User,
        name: str,
        is_public: bool,
    ) -> Album:
        """Create a new album."""
        album = Album(
            name=name,
            is_public=is_public,
            created_by=user.id,
        )
        db.add(album)
        await db.flush()
        # Reload with eagerly loaded relationships so _album_to_response
        # doesn't trigger lazy-load (which fails in async mode).
        result = await db.execute(
            select(Album)
            .options(selectinload(Album.photos))
            .where(Album.id == album.id)
        )
        return result.scalar_one()

    @staticmethod
    async def get_albums(
        db: AsyncSession,
        current_user: User,
    ) -> list[Album]:
        """Get all public albums + the current user's private albums, newest first."""
        result = await db.execute(
            select(Album)
            .options(selectinload(Album.photos))
            .where(
                (Album.is_public) | (Album.created_by == current_user.id)
            )
            .order_by(Album.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_album_by_id(db: AsyncSession, album_id: int) -> Album | None:
        """Get a single album by ID, with photos eagerly loaded."""
        result = await db.execute(
            select(Album)
            .options(selectinload(Album.photos))
            .where(Album.id == album_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_album(db: AsyncSession, album: Album) -> None:
        """Delete an album. Associated photos have their album_id set to NULL (SET NULL FK)."""
        await db.delete(album)
        await db.flush()
