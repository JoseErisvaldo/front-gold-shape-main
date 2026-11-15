export const storefrontEndpoints = {
  products: "/public/products",
  product: (productId: string) => `/public/products/${productId}`,
  categories: "/public/categories",
  store: "/public/store",
  checkout: "/checkout",
  checkoutStatus: (orderNsu: string) => `/checkout/${encodeURIComponent(orderNsu)}`,
  cartPrices: "/public/cart-prices",
  paymentMethods: "/public/payment-methods",
  customerAddresses: "/me/addresses",
} as const;
