import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { Box } from "@mui/material";
import type { PublicProduct, PublicVariant } from "../../types/storefront.types";
import { ProductCard } from "../product-card/product-card";
import { ProductsGrid } from "../products-grid/products-grid";
import { SectionHeading } from "../section-heading/section-heading";

type OffersRailProps = {
  products: PublicProduct[];
  onProductClick: (product: PublicProduct) => void;
  onQuickAdd: (product: PublicProduct, variant: PublicVariant) => void;
  onSeeAll: () => void;
};

export function OffersRail({ products, onProductClick, onQuickAdd, onSeeAll }: OffersRailProps) {
  return (
    <Box component="section" aria-label="Ofertas">
      <SectionHeading
        title="Ofertas do dia"
        subtitle="Produtos com desconto para aproveitar agora."
        icon={<LocalOfferRoundedIcon fontSize="small" />}
        actionLabel="Ver todas"
        onActionClick={onSeeAll}
      />

      <ProductsGrid>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </ProductsGrid>
    </Box>
  );
}
