"""Shared image utilities — magic-byte detection, extension helpers, etc."""


def detect_image_type(content: bytes) -> str | None:
    """Detect image MIME type from file header (magic bytes).

    Returns one of ``"image/jpeg"``, ``"image/png"``, ``"image/webp"``,
    or ``None`` if the content cannot be identified.
    """
    if len(content) < 12:
        return None

    # JPEG: FF D8 FF
    if content[:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # PNG: 89 50 4E 47 0D 0A 1A 0A
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"

    # WebP: RIFF .... WEBP
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"

    return None
