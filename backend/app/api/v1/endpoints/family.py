"""Family tree online-status endpoint — returns which family members are currently online.

For now the logic is simple: the authenticated user's name matches the
family-tree record for that person. In the future this will be extended
with WebSocket / presence tracking for video-call functionality.
"""

from fastapi import APIRouter, Depends
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
    """Return online/offline status for every family member.

    If the request carries a valid JWT and the logged-in user's *username*
    matches a family member name, that member is marked online.
    Everyone else is offline.

    Response shape:
        { "members": [ {"name": "Qyj", "online": true}, ... ] }
    """
    online_name: str | None = None

    if current_user is not None:
        online_name = current_user.username

    members = [
        {"name": name, "online": name == online_name}
        for name in sorted(FAMILY_MEMBER_NAMES)
    ]

    return success_response({"members": members})
