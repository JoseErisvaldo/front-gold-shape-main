import { apiClient } from "../../../../../../shared/services/api-client";
import { logError } from "../../../../../../shared/utils";
import { storeOriginAddressSchema, storeSchema } from "../schema/store-schema";
import type { StoreOriginAddress } from "../types/store.types";

export async function updateStoreAddressService(id: string, input: StoreOriginAddress) {
  try {
    const payload = storeOriginAddressSchema.parse(input);
    const { data } = await apiClient.patch<unknown>(`/store/${encodeURIComponent(id)}`, payload);
    return storeSchema.parse(data);
  } catch (error) {
    logError("updateStoreAddressService", error);
    throw error;
  }
}
