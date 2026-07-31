from typing import Any

from fastapi.responses import JSONResponse


def success_response(data: Any = None, message: str = "success") -> JSONResponse:
    """Unified success response matching the frontend ApiResponse contract."""
    return JSONResponse(
        content={
            "code": 0,
            "message": message,
            "data": data,
        }
    )


def error_response(code: int, message: str, status_code: int = 400, data: Any = None) -> JSONResponse:
    """Unified error response matching the frontend ApiResponse contract."""
    return JSONResponse(
        status_code=status_code,
        content={
            "code": code,
            "message": message,
            "data": data,
        },
    )
