import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storeQueryKeys } from "../endpoints-keys/store.keys";
import { updateStoreAddressService } from "../services/update-store-address.service";
import type { StoreOriginAddress } from "../types/store.types";

export function useUpdateStoreAddressMutation(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: StoreOriginAddress) =>
      updateStoreAddressService(storeId, address),
    onSuccess: async () => {
      toast.success("Endereço de origem atualizado.");
      await queryClient.invalidateQueries({ queryKey: storeQueryKeys.lists() });
    },
    onError: () => toast.error("Não foi possível atualizar o endereço de origem."),
  });
}
