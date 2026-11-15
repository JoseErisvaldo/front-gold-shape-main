import { z } from "zod";
import { apiClient } from "../../../../../../shared/services/api-client";
import { logError } from "../../../../../../shared/utils";
import type { CartItem, DeliveryInfo } from "../types/storefront.types";
import { storefrontEndpoints } from "./storefront-endpoints";

const checkoutResponseSchema = z.object({
  id: z.string(),
  orderNsu: z.string(),
  status: z.enum(["PENDING", "PAID", "CANCELED"]),
  amount: z.number(),
  deliveryFee: z.number(),
  deliveryFeePending: z.boolean(),
  paymentMethodName: z.string(),
  paymentStatus: z.string(),
  paymentStatusDetail: z.string().nullable(),
  pixQrCode: z.string().nullable(),
  pixQrCodeBase64: z.string().nullable(),
  pixTicketUrl: z.string().nullable(),
  paymentExpiresAt: z.string().nullable(),
  items: z.array(
    z.object({
      productName: z.string(),
      variantLabel: z.string().nullable(),
      sku: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      regularUnitPrice: z.number(),
    }),
  ),
});

export const checkoutStatusSchema = checkoutResponseSchema
  .omit({
    paymentStatus: true,
    paymentStatusDetail: true,
  })
  .extend({
    paymentStatus: z.string().nullable(),
    paymentStatusDetail: z.string().nullable(),
    paymentMethodName: z.string().nullable(),
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

export type CheckoutPayment =
  | { type: "pix" }
  | {
      type: "card";
      token: string;
      paymentMethodId: string;
      paymentTypeId: "credit_card" | "debit_card" | "prepaid_card";
      installments: number;
      identification?: { type: "CPF" | "CNPJ"; number: string };
    };

export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export type CheckoutStatus = z.infer<typeof checkoutStatusSchema>;

export async function createCheckoutService(
  items: CartItem[],
  delivery: DeliveryInfo,
  whatsapp: string,
  paymentMethodId: string,
  payment: CheckoutPayment,
  isPix: boolean,
): Promise<CheckoutResponse> {
  if (!delivery.addressId) {
    throw new Error("Selecione um endereço de entrega para continuar.");
  }

  try {
    const { data } = await apiClient.post(storefrontEndpoints.checkout, {
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        expectedUnitPriceCents: Math.round((isPix ? item.unitPrice : item.originalPrice) * 100),
      })),
      customerAddressId: delivery.addressId,
      whatsapp,
      paymentMethodId,
      payment,
    });

    return checkoutResponseSchema.parse(data);
  } catch (error) {
    logError("createCheckoutService", error);
    throw error;
  }
}

export async function getCheckoutStatusService(orderNsu: string): Promise<CheckoutStatus> {
  try {
    const { data } = await apiClient.get(storefrontEndpoints.checkoutStatus(orderNsu));
    return checkoutStatusSchema.parse(data);
  } catch (error) {
    logError("getCheckoutStatusService", error);
    throw error;
  }
}
