// src/lib/types.ts

export type ProductStatus = "active" | "draft" | "archived";

export type Category = "office" | "dining" | "lounge" | "outdoor" | "other";

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

export interface CmsConfig {
  repo_path: string;
  default_branch: string;
  preview_branch: string;
  cloudflare_project: string;  // e.g. "plastopol-website"
}

export interface CommitEntry {
  hash: string;
  message: string;
  date: string;
}

export type BuildStatus = "idle" | "building" | "success" | "error";
export type PreviewStatus = "idle" | "pushing" | "building" | "ready" | "error";

export interface AppState {
  config: CmsConfig | null;
  products: Product[];
  selectedId: string | null;
  // Holds a brand-new product that has NOT yet been committed to `products`.
  // Set when the user clicks "+ Add", cleared on Save (inserts into products)
  // or when the user navigates away without saving.
  pendingNewProduct: Product | null;
  unsaved: boolean;
  buildStatus: BuildStatus;
  buildMessage: string;
  previewStatus: PreviewStatus;
  previewUrl: string;
}
