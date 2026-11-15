import type { z } from "zod";
import type {
  createStoreSchema,
  storeOriginAddressSchema,
  storeSchema,
  updateStoreProfileSchema,
} from "../schema/store-schema";

export type CreateStorePayload = z.infer<typeof createStoreSchema>;
export type Store = z.infer<typeof storeSchema>;
export type StoreOriginAddress = z.infer<typeof storeOriginAddressSchema>;
export type UpdateStoreProfile = z.infer<typeof updateStoreProfileSchema>;
