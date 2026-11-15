import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CustomerAddressInput } from "../schema/customer-address-schema";
import {
  createCustomerAddressService,
  deleteCustomerAddressService,
  getCustomerAddressesService,
  updateCustomerAddressService,
} from "../services/customer-address.service";

const customerAddressesQueryKey = ["storefront", "customer-addresses"] as const;

export function useCustomerAddresses(enabled: boolean) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: customerAddressesQueryKey });

  const query = useQuery({
    queryKey: customerAddressesQueryKey,
    queryFn: getCustomerAddressesService,
    enabled,
  });
  const create = useMutation({
    mutationFn: createCustomerAddressService,
    onSuccess: async () => {
      toast.success("Endereço cadastrado.");
      await invalidate();
    },
    onError: () => toast.error("Não foi possível cadastrar o endereço."),
  });
  const update = useMutation({
    mutationFn: updateCustomerAddressService,
    onSuccess: async () => {
      toast.success("Endereço atualizado.");
      await invalidate();
    },
    onError: () => toast.error("Não foi possível atualizar o endereço."),
  });
  const remove = useMutation({
    mutationFn: deleteCustomerAddressService,
    onSuccess: async () => {
      toast.success("Endereço removido.");
      await invalidate();
    },
    onError: () => toast.error("Não foi possível remover o endereço."),
  });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createAddress: (input: CustomerAddressInput) => create.mutateAsync(input),
    updateAddress: (input: CustomerAddressInput & { id: string }) => update.mutateAsync(input),
    deleteAddress: (id: string) => remove.mutateAsync(id),
    isSavingAddress: create.isPending || update.isPending,
    isDeletingAddress: remove.isPending,
  };
}
