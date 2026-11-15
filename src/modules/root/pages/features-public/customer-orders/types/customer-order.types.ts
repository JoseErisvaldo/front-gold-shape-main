import type { z } from "zod";
import type {
  customerOrderSchema,
  customerOrdersResponseSchema,
} from "../schema/customer-order-schema";

export type CustomerOrder = z.infer<typeof customerOrderSchema>;
export type CustomerOrdersResponse = z.infer<typeof customerOrdersResponseSchema>;
