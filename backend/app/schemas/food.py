from pydantic import BaseModel, Field


class OrderItemSchema(BaseModel):
    """单条点单菜品 — 前端使用 camelCase 发送，此处通过 alias 映射。"""

    dish_id: int = Field(alias="dishId")
    dish_name: str = Field(alias="dishName")
    quantity: int = Field(..., ge=1)

    model_config = {"populate_by_name": True}


class SubmitOrderRequest(BaseModel):
    """提交点单请求。"""

    items: list[OrderItemSchema]
    note: str = Field("", max_length=500)
