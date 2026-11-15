import { Box } from "@mui/material";
import { StoreProfileView } from "../../store-profile/views/store-profile.view";
import { StorefrontLayout } from "../components/storefront-layout/storefront-layout";
import { useStorefrontPageTracking } from "../hooks/use-storefront-page-tracking";
import { useStorefrontRoute } from "../hooks/use-storefront-route";
import { ProductDetailsView } from "./product-details.view";
import { StorefrontHomeView } from "./storefront-home.view";

// Site público completo: catálogo (#/), perfil da loja (#/loja) e detalhes do produto (#/produto/:id).
// A home continua montada (só escondida) ao abrir outra página, então filtros,
// páginas carregadas e posição da rolagem voltam como estavam.
export function StorefrontView() {
  const { route, goToProduct, goToHome, goToStore } = useStorefrontRoute();

  useStorefrontPageTracking(route);

  return (
    <StorefrontLayout onHomeClick={goToHome} onStoreClick={goToStore}>
      <Box sx={{ display: route.page === "home" ? "block" : "none" }}>
        <StorefrontHomeView onProductClick={goToProduct} onStoreClick={goToStore} />
      </Box>

      {route.page === "store" && <StoreProfileView onBack={goToHome} />}

      {route.page === "product" && (
        <ProductDetailsView
          key={route.productId}
          productId={route.productId}
          onBack={goToHome}
          onProductClick={goToProduct}
        />
      )}
    </StorefrontLayout>
  );
}
