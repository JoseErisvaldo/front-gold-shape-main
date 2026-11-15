import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storefrontQueryKeys } from "../../../features-public/storefront/endpoints-keys/storefront.keys";
import { storeQueryKeys } from "../endpoints-keys/store.keys";
import { updateStoreProfileService } from "../services/update-store-profile.service";
import type { UpdateStoreProfile } from "../types/store.types";

export function useUpdateStoreProfileMutation(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UpdateStoreProfile) =>
      updateStoreProfileService(storeId, profile),
    onSuccess: async () => {
      toast.success("Perfil da loja atualizado.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: storeQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: storefrontQueryKeys.store() }),
      ]);
    },
    onError: () => toast.error("Não foi possível atualizar o perfil da loja."),
  });
}
