import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { LoginView, RegisterView } from "./modules/root/pages/features/auth";
import { RedirectView } from "./modules/root/pages/features/auth/views/redirect.view";
import { CategoriesView } from "./modules/root/pages/features/categories";
import { DashboardView } from "./modules/root/pages/features/dashboard";
import { HomeView } from "./modules/root/pages/features/home";
import { ListUsersView } from "./modules/root/pages/features/list-users";
import { NotFoundView } from "./modules/root/pages/features/not-found";
import { OrdersView } from "./modules/root/pages/features/orders";
import { PaymentMethodsView } from "./modules/root/pages/features/payment-methods";
import { ProductsListView } from "./modules/root/pages/features/products";
import { CreateProductView } from "./modules/root/pages/features/products/views/create-product.view";
import { StoresView } from "./modules/root/pages/features/store";
import { useStoresQuery } from "./modules/root/pages/features/store/queries/use-stores-query";
import { ProfileView } from "./modules/root/pages/features/users";
import { CustomerOrdersView } from "./modules/root/pages/features-public/customer-orders";
import { StoreProfileView } from "./modules/root/pages/features-public/store-profile";
import { StorefrontView } from "./modules/root/pages/features-public/storefront";
import { AppLayout } from "./shared/components/layout";
import { queryClient } from "./shared/services/queries";
import { useAuthStore } from "./shared/store";

function LoginRoute() {
  const session = useAuthStore((state) => state.session);

  return session ? <Navigate to="/redirect" replace /> : <LoginView />;
}

function RegisterRoute() {
  const session = useAuthStore((state) => state.session);

  return session ? <Navigate to="/redirect" replace /> : <RegisterView />;
}

function CustomerOrdersRoute() {
  const session = useAuthStore((state) => state.session);
  return session ? <CustomerOrdersView /> : <Navigate to="/session" replace />;
}

function ProtectedHomeRoute() {
  const session = useAuthStore((state) => state.session);

  if (!session) return <Navigate to="/session" replace />;
  if (session.role !== "ADMIN" && session.role !== "MODERADOR") {
    return <Navigate to="/redirect" replace />;
  }

  return <Outlet />;
}

function AuthenticatedLayout() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const { data: stores = [] } = useStoresQuery();
  const store = stores[0];

  return (
    <AppLayout
      storeName={store?.name ?? "Loja"}
      storeImageUrl={store?.imageUrl ?? null}
      onLogout={() => {
        clearSession();
        queryClient.clear();
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <Routes>
        <Route path="/session" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/redirect" element={<RedirectView />} />
        <Route path="/" element={<StorefrontView />} />
        <Route path="/loja" element={<StoreProfileView />} />
        <Route path="/meus-pedidos" element={<CustomerOrdersRoute />} />
        <Route element={<ProtectedHomeRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/home" element={<HomeView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/store-manage" element={<StoresView />} />
            <Route path="/categories" element={<CategoriesView />} />
            <Route path="/products" element={<ProductsListView />} />
            <Route path="/products/create" element={<CreateProductView />} />
            <Route path="/orders" element={<OrdersView />} />
            <Route path="/payment-methods" element={<PaymentMethodsView />} />
            <Route path="/list-users" element={<ListUsersView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
