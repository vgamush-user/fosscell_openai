// src/features/catalog/sortProducts.ts

import { Product } from "@/types";

export type SortOption =
  | "name-asc"
  | "name-desc";

export function sortProducts(
  products: Product[],
  sort?: SortOption
): Product[] {
  if (!sort) return products;

  return [...products].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.modelName.localeCompare(b.modelName);

      case "name-desc":
        return b.modelName.localeCompare(a.modelName);

      default:
        return 0;
    }
  });
}
