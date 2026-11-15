import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Box } from "@mui/material";
import type { PublicProduct, PublicVariant } from "../../types/storefront.types";
import { ProductCard } from "../product-card/product-card";
import { ProductsGrid } from "../products-grid/products-grid";
import { SectionHeading } from "../section-heading/section-heading";

type FeaturedProductsRailProps = {
  products: PublicProduct[];
  onProductClick: (product: PublicProduct) => void;
  onQuickAdd: (product: PublicProduct, variant: PublicVariant) => void;
  onSeeAll: () => void;
};

export function FeaturedProductsRail({
  products,
  onProductClick,
  onQuickAdd,
  onSeeAll,
}: FeaturedProductsRailProps) {
  if (products.length === 0) return null;

  return (
    <Box component="section" aria-label="Destaques para você">
      <SectionHeading
        title="Destaques para você"
        subtitle="Produtos selecionados pela loja."
        icon={<StarRoundedIcon fontSize="small" />}
        actionLabel="Ver todos"
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
