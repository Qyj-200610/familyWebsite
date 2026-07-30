"""Family tree endpoint — returns online status and avatar for every family member.

Online-status logic: the authenticated user's name matches the family-tree
record for that person. Avatars are pulled from the User table by matching
family member names to registered usernames.

In the future online status will be extended with WebSocket / presence
tracking for video-call functionality.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_optional_user
from app.core.database import get_db
from app.core.response import success_response
from app.models.user import User

router = APIRouter(prefix="/family", tags=["family"])

# All known family-member names (kept in sync with the frontend FAMILY_DATA).
FAMILY_MEMBER_NAMES = {"Lhf", "Lqb", "Lqq", "Qd", "Qyj", "Ljy", "Lln", "Lyj"}


@router.get("/status")
async def get_family_status(
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Return online/offline status and avatar for every family member.

    If the request carries a valid JWT and the logged-in user's *username*
    matches a family member name, that member is marked online.
    Everyone else is offline.

    Avatar URLs come from the User table (matching username to family member
    name).  Members who have not registered return ``null``.

    Response shape:
        { "members": [ {"name": "Qyj", "online": true, "avatar": "/uploads/avatars/xxx.jpg"}, ... ] }
    """
    # --- online status ---
    online_name: str | None = None
    if current_user is not None:
        online_name = current_user.username

    # --- avatar lookup ---
    result = await db.execute(
        select(User.username, User.avatar).where(
            User.username.in_(FAMILY_MEMBER_NAMES)
        )
    )
    # Build a *case-insensitive* map so that the canonical FAMILY_MEMBER_NAMES
    # keys always resolve to the actual avatar path stored in the database,
    # regardless of how the user capitalised their username during registration.
    avatar_map: dict[str, str | None] = {
        row.username.lower(): row.avatar for row in result.all()
    }

    # Normalise online_name for the same reason — MySQL's IN is CI, Python's
    # == is CS, so we must compare folded values.
    online_name_folded = online_name.lower() if online_name else None

    members = [
        {
            "name": name,
            "online": name.lower() == online_name_folded,
            "avatar": avatar_map.get(name.lower()),
        }
        for name in sorted(FAMILY_MEMBER_NAMES)
    ]

    return success_response({"members": members})
