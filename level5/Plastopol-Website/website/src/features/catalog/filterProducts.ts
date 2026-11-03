// src/features/catalog/filterProducts.ts

import { Product, CatalogFilters } from "@/types";

export function filterProducts(
  products: Product[],
  filters: CatalogFilters
): Product[] {
  return products.filter((product) => {
    // Category
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Colors
    if (
      filters.colors &&
      filters.colors.length > 0 &&
      !filters.colors.some((c) => product.colors.includes(c))
    ) {
      return false;
    }

    // Stock
    if (
      filters.inStock !== undefined &&
      product.inStock !== filters.inStock
    ) {
      return false;
    }

    return true;
  });
}
