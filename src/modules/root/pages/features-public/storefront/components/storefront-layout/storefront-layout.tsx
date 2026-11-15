import { Box } from "@mui/material";
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../../../../../../shared/services/queries";
import { useAuthStore } from "../../../../../../../shared/store";
import { useStorefrontLayout } from "../../hooks/use-storefront-layout";
import { CartDrawer } from "../cart-drawer/cart-drawer";
import { StorefrontFooter } from "../storefront-footer/storefront-footer";
import { StorefrontHeader } from "../storefront-header/storefront-header";
import { WhatsAppFab } from "../whatsapp-fab/whatsapp-fab";

type StorefrontLayoutProps = {
  onHomeClick: () => void;
  onStoreClick: () => void;
  children: ReactNode;
};

export function StorefrontLayout({ children, onHomeClick, onStoreClick }: StorefrontLayoutProps) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const {
    storeName,
    storeImageUrl,
    isStoreLoading,
    whatsappUrl,
    itemsCount,
    isCartOpen,
    openCart,
    closeCart,
  } = useStorefrontLayout();

  useEffect(() => {
    if (session && sessionStorage.getItem("goldshape-storefront-checkout-step") === "delivery") {
      openCart();
    }
  }, [openCart, session]);

  const handleLogout = () => {
    clearSession();
    queryClient.clear();
    void navigate("/session", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 10% 90%, rgba(22, 163, 74, 0.08), transparent 26%), #f4f6fb",
      }}
    >
      <StorefrontHeader
        storeName={storeName}
        storeImageUrl={storeImageUrl}
        isStoreLoading={isStoreLoading}
        isAuthenticated={Boolean(session)}
        itemsCount={itemsCount}
        onHomeClick={onHomeClick}
        onLogout={handleLogout}
        onOrdersClick={() => void navigate("/meus-pedidos")}
        onStoreClick={onStoreClick}
        onCartClick={openCart}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 4 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        {children}
      </Box>

      <StorefrontFooter storeName={storeName} whatsappUrl={whatsappUrl} />

      <CartDrawer open={isCartOpen} onClose={closeCart} />

      {whatsappUrl && <WhatsAppFab href={whatsappUrl} />}
    </Box>
  );
}
