import logging

from fastapi import APIRouter

from app.api.v1.endpoints import album, auth, family, food, photo, user
from app.core.database import engine
from app.core.response import error_response, success_response
from sqlalchemy import text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    """Health check endpoint — verifies the API server and database are running."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return success_response({"status": "healthy", "database": "connected"}, message="ok")
    except Exception:
        logger.exception("Health check: database unreachable")
        return error_response(5000, "服务异常", status_code=503, data={"status": "degraded", "database": "unreachable"})


router.include_router(album.router)
router.include_router(auth.router)
router.include_router(family.router)
router.include_router(user.router)
router.include_router(photo.router)
router.include_router(food.router)
