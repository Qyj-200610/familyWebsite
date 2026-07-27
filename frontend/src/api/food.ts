import client from "./client";
import type { SubmitOrderRequest } from "./types";

export const foodApi = {
  /** 提交点单 */
  submitOrder: (data: SubmitOrderRequest) =>
    client.post<null>("/food/orders", data),
};
