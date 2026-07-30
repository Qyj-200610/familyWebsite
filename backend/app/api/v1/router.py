from fastapi import APIRouter

from app.api.v1.endpoints import album, auth, family, food, photo, user
from app.core.response import success_response

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    """Health check endpoint — verifies the API server is running."""
    return success_response({"status": "healthy"}, message="ok")


router.include_router(album.router)
router.include_router(auth.router)
router.include_router(family.router)
router.include_router(user.router)
router.include_router(photo.router)
router.include_router(food.router)
