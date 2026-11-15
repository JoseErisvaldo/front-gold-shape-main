import { useQuery } from "@tanstack/react-query";
import { customerOrdersQueryKeys } from "../endpoints-keys/customer-orders.keys";
import { listCustomerOrdersService } from "../services/list-customer-orders.service";

export function useCustomerOrdersQuery(page: number) {
  return useQuery({
    queryKey: customerOrdersQueryKeys.list(page),
    queryFn: () => listCustomerOrdersService(page),
    refetchInterval: (query) =>
      query.state.data?.orders.some((order) => order.status === "PENDING") ? 15_000 : false,
  });
}
