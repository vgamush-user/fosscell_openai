// src/features/catalog/catalogIndex.ts

import Fuse from "fuse.js";
import { Product } from "../../types";

export function createSearchIndex(products: Product[]) {
  return new Fuse(products, {
    keys: [
      "modelName",
      "description",
      "features",
      "tags",
      "category",
    ],
    threshold: 0.3, // lower = stricter search
  });
}
