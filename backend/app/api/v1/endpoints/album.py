from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.response import error_response, success_response
from app.models.user import User
from app.schemas.album import AlbumCreateRequest, AlbumResponse
from app.schemas.photo import PhotoResponse
from app.services.album import AlbumService
from app.services.photo import PhotoService

router = APIRouter(prefix="/albums", tags=["albums"])

# ---------- 错误码映射 ----------

_ERROR_MAP = {
    "EMPTY_NAME": (3201, "相册名称不能为空"),
    "ALBUM_NOT_FOUND": (3202, "相册不存在"),
    "FORBIDDEN": (3203, "无权访问该相册"),
    "NOT_OWNER": (3204, "只能操作自己创建的相册"),
}

_PHOTO_ERROR_MAP = {
    "FILENAME_MISSING": (3001, "请选择要上传的文件"),
    "UNSUPPORTED_FORMAT": (3002, "不支持的文件格式，仅允许 jpg、png、webp"),
    "UNSUPPORTED_CONTENT_TYPE": (3003, "不支持的文件类型，仅允许 jpg、png、webp"),
    "FILE_TOO_LARGE": (3004, f"文件大小超出限制（最大 {PhotoService.MAX_FILE_SIZE // (1024 * 1024)} MB）"),
    "INVALID_IMAGE": (3005, "文件内容不是有效的图片格式"),
}


def _photo_count(album) -> int:
    """Return the number of photos in *album*.

    The service layer always eager-loads ``album.photos`` via selectinload,
    so we can safely use len().
    """
    photos = album.photos
    return len(photos) if photos else 0


def _album_to_response(album) -> dict:
    """Convert an Album ORM object to a response dict."""
    cover_photo = None
    n_photos = _photo_count(album)
    if n_photos > 0:
        latest = sorted(album.photos, key=lambda p: p.created_at, reverse=True)
        cover_photo = PhotoResponse(
            id=latest[0].id,
            filename=latest[0].filename,
            original_filename=latest[0].original_filename,
            file_size=latest[0].file_size,
            content_type=latest[0].content_type,
            description=latest[0].description,
            uploaded_by=latest[0].uploaded_by,
            uploader={"id": latest[0].uploader.id, "username": latest[0].uploader.username} if latest[0].uploader else None,
            album_id=latest[0].album_id,
            created_at=latest[0].created_at,
        ).model_dump(mode="json", by_alias=True)

    return AlbumResponse(
        id=album.id,
        name=album.name,
        is_public=album.is_public,
        created_by=album.created_by,
        creator={"id": album.creator.id, "username": album.creator.username} if album.creator else None,
        photo_count=n_photos,
        created_at=album.created_at,
    ).model_dump(mode="json", by_alias=True) | {"coverPhoto": cover_photo}


def _photo_to_response(photo) -> dict:
    """Convert a Photo ORM object to a response dict."""
    return PhotoResponse(
        id=photo.id,
        filename=photo.filename,
        original_filename=photo.original_filename,
        file_size=photo.file_size,
        content_type=photo.content_type,
        description=photo.description,
        uploaded_by=photo.uploaded_by,
        uploader={"id": photo.uploader.id, "username": photo.uploader.username} if photo.uploader else None,
        album_id=photo.album_id,
        created_at=photo.created_at,
    ).model_dump(mode="json", by_alias=True)


@router.post("")
async def create_album(
    body: AlbumCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建新相册。"""
    name = body.name.strip()
    if not name:
        code, msg = _ERROR_MAP["EMPTY_NAME"]
        return error_response(code, msg)

    album = await AlbumService.create_album(db, current_user, name, body.is_public)
    return success_response(_album_to_response(album), message="相册创建成功")


@router.get("")
async def get_albums(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取相册列表（公开相册 + 自己的私有相册）。"""
    albums = await AlbumService.get_albums(db, current_user)
    return success_response([_album_to_response(a) for a in albums])


@router.get("/{album_id}")
async def get_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取单个相册详情，包含照片列表。"""
    album = await AlbumService.get_album_by_id(db, album_id)
    if album is None:
        return error_response(3202, "相册不存在", status_code=404)

    # 私有相册仅创建者可访问
    if not album.is_public and album.created_by != current_user.id:
        return error_response(3203, "无权访问该相册", status_code=403)

    album_data = _album_to_response(album)
    photos_list = list(album.photos) if album.photos else []
    sorted_photos = sorted(photos_list, key=lambda p: p.created_at, reverse=True)
    album_data["photos"] = [_photo_to_response(p) for p in sorted_photos]

    return success_response(album_data)


@router.delete("/{album_id}")
async def delete_album(
    album_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除相册（仅创建者可操作，关联照片不删除）。"""
    album = await AlbumService.get_album_by_id(db, album_id)
    if album is None:
        return error_response(3202, "相册不存在", status_code=404)

    if album.created_by != current_user.id:
        return error_response(3204, "只能删除自己创建的相册", status_code=403)

    await AlbumService.delete_album(db, album)
    return success_response(None, message="相册已删除")


# ── 相册内照片上传 ──────────────────────────────────────────────


@router.post("/{album_id}/photos/upload")
async def upload_photo_to_album(
    album_id: int,
    file: UploadFile = File(...),
    description: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """上传照片到指定相册。仅允许 JPEG、PNG、WebP，最大 10 MB。"""
    # 先校验相册存在且有权限
    album = await AlbumService.get_album_by_id(db, album_id)
    if album is None:
        return error_response(3202, "相册不存在", status_code=404)
    if not album.is_public and album.created_by != current_user.id:
        return error_response(3203, "无权访问该相册", status_code=403)

    try:
        photo = await PhotoService.upload_photo(db, current_user, file, description, album_id=album_id)
    except ValueError as e:
        code, msg = _PHOTO_ERROR_MAP.get(str(e), (3000, "上传失败"))
        return error_response(code, msg)

    return success_response(_photo_to_response(photo), message="照片上传成功")


@router.get("/{album_id}/photos")
async def get_album_photos(
    album_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取相册内的照片列表（分页）。"""
    album = await AlbumService.get_album_by_id(db, album_id)
    if album is None:
        return error_response(3202, "相册不存在", status_code=404)
    if not album.is_public and album.created_by != current_user.id:
        return error_response(3203, "无权访问该相册", status_code=403)

    photos = await PhotoService.get_photos(db, skip=skip, limit=limit, album_id=album_id)
    return success_response([_photo_to_response(p) for p in photos])
