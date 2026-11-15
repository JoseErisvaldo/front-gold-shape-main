import { apiClient } from "../../../../../../shared/services/api-client";
import { logError } from "../../../../../../shared/utils";
import { storeSchema, updateStoreProfileSchema } from "../schema/store-schema";
import type { UpdateStoreProfile } from "../types/store.types";

export async function updateStoreProfileService(
  id: string,
  input: UpdateStoreProfile,
) {
  try {
    const payload = updateStoreProfileSchema.parse(input);
    const { data } = await apiClient.patch<unknown>(
      `/store/${encodeURIComponent(id)}`,
      payload,
    );
    return storeSchema.parse(data);
  } catch (error) {
    logError("updateStoreProfileService", error);
    throw error;
  }
}
