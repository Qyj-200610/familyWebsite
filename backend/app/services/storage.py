"""
Cloudinary 存储服务 — 上传、删除、URL 生成。

头像存储在 family-website/avatars/ 目录下，
照片存储在 family-website/photos/ 目录下。
"""

import io
import logging
import threading
from typing import Optional

import cloudinary
import cloudinary.api
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError

from app.core.config import settings

logger = logging.getLogger(__name__)

_initialized = False
_init_lock = threading.Lock()


def _ensure_initialized() -> None:
    """延迟初始化 Cloudinary（等 settings 加载完成）。"""
    global _initialized
    if _initialized:
        return
    with _init_lock:
        if _initialized:
            return  # Double-checked locking — another thread may have beaten us
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _initialized = True


# ── 公开 API ────────────────────────────────────────────────


class CloudinaryNotConfiguredError(RuntimeError):
    """Raised when Cloudinary credentials are missing."""


class CloudinaryUploadError(RuntimeError):
    """Raised when Cloudinary upload fails for any reason other than missing config."""


def upload_image(file_content: bytes, public_id: str, folder: str) -> str:
    """上传图片到 Cloudinary，返回 public_id。

    将原始字节包装为 BytesIO，确保 Cloudinary SDK 走其标准
    file-like / stream 处理分支（而非 fallback else 分支）。

    Args:
        file_content: 图片二进制内容
        public_id: 唯一标识（不含扩展名），如 uuid.hex
        folder: 存储目录，如 "family-website/avatars" 或 "family-website/photos"

    Returns:
        Cloudinary public_id，如 "family-website/avatars/abc123"

    Raises:
        CloudinaryNotConfiguredError: Cloudinary 凭证未配置
        CloudinaryUploadError: 上传失败（网络、认证、Cloudinary API 错误等）
    """
    # 凭证检查必须在初始化之前，避免用空凭证初始化
    if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_API_SECRET:
        raise CloudinaryNotConfiguredError(
            "Cloudinary 未配置，请在 .env 中设置 CLOUDINARY_CLOUD_NAME、CLOUDINARY_API_KEY、CLOUDINARY_API_SECRET"
        )

    _ensure_initialized()

    try:
        # 使用 BytesIO 包装，让 SDK 走标准 stream 处理路径
        # （bytes 没有 .read()，会走 else fallback 分支，兼容性不如 stream 路径）
        result = cloudinary.uploader.upload(
            io.BytesIO(file_content),
            public_id=f"{folder}/{public_id}",
            overwrite=True,
            resource_type="image",
        )
        logger.info("Uploaded to Cloudinary: %s", result["public_id"])
        return result["public_id"]
    except CloudinaryError as e:
        logger.exception("Cloudinary upload failed for %s/%s", folder, public_id)
        raise CloudinaryUploadError(str(e)) from e


def delete_image(public_id: str) -> None:
    """从 Cloudinary 删除图片（best-effort，失败不抛异常）。"""
    _ensure_initialized()

    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        logger.info("Deleted from Cloudinary: %s → %s", public_id, result.get("result"))
    except Exception:
        logger.warning("Failed to delete from Cloudinary: %s", public_id, exc_info=True)


def get_url(public_id: str) -> str:
    """根据 Cloudinary public_id 生成公网访问 URL。

    public_id 如果是旧格式（如 /uploads/avatars/xxx.jpg 或纯文件名），
    则原样返回，由前端 uploadUrl 处理。
    """
    # 已是完整 URL → 直接返回
    if public_id.startswith(("http://", "https://")):
        return public_id

    # 旧格式本地路径或纯文件名 → 原样返回，前端兜底
    if public_id.startswith("/") or "/" not in public_id or not public_id.startswith("family-website/"):
        return public_id

    # Cloudinary public_id → 生成 URL
    _ensure_initialized()
    return cloudinary.CloudinaryImage(public_id).build_url(secure=True)


def is_cloudinary_id(value: str | None) -> bool:
    """判断是否为 Cloudinary public_id（非旧本地路径）。"""
    if not value:
        return False
    return value.startswith("family-website/")
