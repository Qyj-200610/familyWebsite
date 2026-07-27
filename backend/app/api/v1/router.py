from fastapi import APIRouter

from app.api.v1.endpoints import auth, food, photo, user

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    """Health check endpoint — verifies the API server is running."""
    return {"code": 0, "message": "ok", "data": {"status": "healthy"}}


router.include_router(auth.router)
router.include_router(user.router)
router.include_router(photo.router)
router.include_router(food.router)
