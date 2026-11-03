// src/features/products/getProductsBySlug.ts

import productsData from "../../../content/products.json";
import { Product } from "../../types";

export function getProductBySlug(slug: string): Product | null {
  const product = (productsData as Product[]).find(
    (p) => p.slug === slug && p.status === "active"
  );
  return product || null;
}
