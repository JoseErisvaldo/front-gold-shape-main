import { z } from "zod";
import { apiClient } from "../../../../../../shared/services/api-client";
import { logError } from "../../../../../../shared/utils";
import {
  type CustomerAddressInput,
  customerAddressesSchema,
  customerAddressInputSchema,
  customerAddressSchema,
} from "../schema/customer-address-schema";
import { storefrontEndpoints } from "./storefront-endpoints";

const endpoint = storefrontEndpoints.customerAddresses;

export async function getCustomerAddressesService() {
  try {
    const { data } = await apiClient.get<unknown>(endpoint);
    return customerAddressesSchema.parse(data);
  } catch (error) {
    logError("getCustomerAddressesService", error);
    throw error;
  }
}

export async function createCustomerAddressService(input: CustomerAddressInput) {
  try {
    const payload = customerAddressInputSchema.parse(input);
    const { data } = await apiClient.post<unknown>(endpoint, payload);
    return customerAddressSchema.parse(data);
  } catch (error) {
    logError("createCustomerAddressService", error);
    throw error;
  }
}

export async function updateCustomerAddressService({
  id,
  ...input
}: CustomerAddressInput & { id: string }) {
  try {
    const payload = customerAddressInputSchema.parse(input);
    const { data } = await apiClient.put<unknown>(`${endpoint}/${encodeURIComponent(id)}`, payload);
    return customerAddressSchema.parse(data);
  } catch (error) {
    logError("updateCustomerAddressService", error);
    throw error;
  }
}

export async function deleteCustomerAddressService(id: string) {
  try {
    z.string().uuid().parse(id);
    await apiClient.delete(`${endpoint}/${encodeURIComponent(id)}`);
  } catch (error) {
    logError("deleteCustomerAddressService", error);
    throw error;
  }
}
