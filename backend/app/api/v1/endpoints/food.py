from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.response import error_response, success_response
from app.models.user import User
from app.schemas.food import SubmitOrderRequest
from app.services.food import FoodService

router = APIRouter(prefix="/food", tags=["food"])


@router.post("/orders")
async def submit_order(
    data: SubmitOrderRequest,
    current_user: User = Depends(get_current_user),
):
    """提交点单并发送邮件通知。"""
    if not data.items:
        return error_response(4001, "订单不能为空")

    items_payload = [
        {"dish_id": item.dish_id, "dish_name": item.dish_name, "quantity": item.quantity}
        for item in data.items
    ]

    try:
        await FoodService.send_order_email(
            username=current_user.username,
            items=items_payload,
            note=data.note,
        )
    except RuntimeError as e:
        return error_response(4002, str(e), status_code=500)

    return success_response(None, message="点单成功！订单已通过邮件通知")
