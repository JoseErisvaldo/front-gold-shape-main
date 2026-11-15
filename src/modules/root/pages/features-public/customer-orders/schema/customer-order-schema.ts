import { z } from "zod";

export const customerOrderSchema = z.object({
  id: z.string(),
  orderNsu: z.string(),
  status: z.enum(["PENDING", "PAID", "CANCELED"]),
  amount: z.number(),
  customerName: z.string().nullable(),
  deliveryFee: z.number(),
  deliveryFeePending: z.boolean(),
  mercadoPagoOrderId: z.string().nullable(),
  mercadoPagoPaymentId: z.string().nullable(),
  mercadoPagoPaymentMethodId: z.string().nullable(),
  mercadoPagoPaymentType: z.string().nullable(),
  mercadoPagoInstallments: z.number().nullable(),
  mercadoPagoStatus: z.string().nullable(),
  mercadoPagoStatusDetail: z.string().nullable(),
  pixQrCode: z.string().nullable(),
  pixQrCodeBase64: z.string().nullable(),
  pixTicketUrl: z.string().nullable(),
  paymentExpiresAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  paymentMethodName: z.string().nullable(),
  cep: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  items: z.array(
    z.object({
      productName: z.string(),
      variantLabel: z.string().nullable(),
      sku: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
});

export const customerOrdersResponseSchema = z.object({
  orders: z.array(customerOrderSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
