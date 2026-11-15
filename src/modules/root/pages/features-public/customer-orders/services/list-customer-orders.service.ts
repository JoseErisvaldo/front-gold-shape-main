import { apiClient } from "../../../../../../shared/services/api-client";
import { logError } from "../../../../../../shared/utils";
import { customerOrdersResponseSchema } from "../schema/customer-order-schema";
import type { CustomerOrdersResponse } from "../types/customer-order.types";

export const CUSTOMER_ORDERS_PAGE_SIZE = 10;

export async function listCustomerOrdersService(page: number): Promise<CustomerOrdersResponse> {
  try {
    const { data } = await apiClient.get("/me/orders", {
      params: { page, pageSize: CUSTOMER_ORDERS_PAGE_SIZE },
    });
    return customerOrdersResponseSchema.parse(data);
  } catch (error) {
    logError("listCustomerOrdersService", error);
    throw error;
  }
}
