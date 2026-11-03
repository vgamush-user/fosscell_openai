// src/types/index.ts

export type ProductStatus = "active" | "draft" | "archived";

export type Category =
  | "office"
  | "dining"
  | "lounge"
  | "outdoor"
  | "other";

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  modelName: string;
  status: ProductStatus;
  colors: string[];
  description: string;
  features: string[];
  specifications: Specification[];
  category: Category;
  tags: string[];
  images: string[];
  thumbnail: string;
  inStock: boolean;
  leadTime: string;
}

export interface ProductInput {
  modelName: string;
  colors: string[];
  description: string;
  features: string[];
  specifications: Specification[];
  category: Category;
  tags: string[];
  inStock: boolean;
  leadTime: string;
}

export interface ProductRecord extends Product {}

export interface SearchResult {
  item: Product;
  score?: number;
}

export interface CatalogFilters {
  category?: Category;
  colors?: string[];
  inStock?: boolean;
}
