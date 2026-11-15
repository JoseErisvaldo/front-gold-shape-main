export const customerOrdersQueryKeys = {
  all: ["customer-orders"] as const,
  list: (page: number) => [...customerOrdersQueryKeys.all, page] as const,
};
