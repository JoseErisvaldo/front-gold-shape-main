import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storefrontQueryKeys } from "../../../features-public/storefront/endpoints-keys/storefront.keys";
import { storeQueryKeys } from "../endpoints-keys/store.keys";
import { createStoreService } from "../services/create-store.service";

export function useCreateStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStoreService,
    onSuccess: async () => {
      toast.success("Loja criada com sucesso!");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: storeQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: storefrontQueryKeys.store() }),
      ]);
    },
  });
}
