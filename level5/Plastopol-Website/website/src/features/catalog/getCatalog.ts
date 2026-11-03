// src/features/catalog/getCatalog.ts

import { getProducts } from "@/features/products/getProducts";
import { createSearchIndex } from "./catalogIndex";
import { filterProducts } from "./filterProducts";
import { sortProducts, SortOption } from "./sortProducts";
import { CatalogFilters, Product } from "@/types";

export interface CatalogResult {
  matched: Product[];
  others: Product[];
}

export interface CatalogParams {
  query?: string;
  filters?: CatalogFilters;
  sort?: SortOption;
}

export function getCatalog({
  query,
  filters = {},
  sort,
}: CatalogParams): CatalogResult {
  const allProducts = getProducts();

  // STEP 1: Filter (strict match)
  let matched = filterProducts(allProducts, filters);

  // STEP 2: Search within matched
  if (query && query.trim() !== "") {
    const fuse = createSearchIndex(matched);
    matched = fuse.search(query).map((r) => r.item);
  }

  // STEP 3: Sort matched
  matched = sortProducts(matched, sort);

  // STEP 4: Remaining products not in matched
  const matchedSlugs = new Set(matched.map((p) => p.slug));
  let others = allProducts.filter((p) => !matchedSlugs.has(p.slug));

  if (query && query.trim() !== "") {
    const fuse = createSearchIndex(others);
    others = fuse.search(query).map((r) => r.item);
  }

  return { matched, others };
}
