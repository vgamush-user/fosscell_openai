// src/lib/product.ts

import type { Product, Category } from "./types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateUniqueSlug(
  name: string,
  existingSlugs: string[]
): string {
  const baseSlug = slugify(name);

  // If no conflict → return immediately
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;

  // Keep incrementing until unique
  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

export function generateId(): string {
  return "chair-" + Math.random().toString(36).slice(2, 7);
}

export function makeImageFilename(slug: string, index: number): string {
  const n = String(index + 1).padStart(3, "0");
  return `${slug}-${n}.jpg`;
}

export function emptyProduct(): Product {
  return {
    id: generateId(),
    slug: "",
    modelName: "",
    status: "draft",
    colors: [],
    description: "",
    features: [],
    specifications: [],
    category: "office",
    tags: [],
    images: [],
    thumbnail: "",
    inStock: true,
    leadTime: "",
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProduct(
  product: Product,
  allProducts: Product[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!product.modelName.trim())
    errors.push({ field: "modelName", message: "Model name is required" });

  if (!product.slug.trim())
    errors.push({ field: "slug", message: "Slug is required" });

  const dupSlug = allProducts.find(
    (p) => p.slug === product.slug && p.id !== product.id
  );
  if (dupSlug)
    errors.push({ field: "slug", message: "Slug already exists" });

  // No duplicate ID check needed — generateId() always produces a unique ID,
  // and editing an existing product retains its own ID by design.

  if (!product.category)
    errors.push({ field: "category", message: "Category is required" });

  product.specifications.forEach((spec, i) => {
    if (!spec.key.trim() || !spec.value.trim())
      errors.push({
        field: `spec_${i}`,
        message: `Specification row ${i + 1} has empty key or value`,
      });
  });

  return errors;
}

export const CATEGORIES: Category[] = [
  "office",
  "dining",
  "lounge",
  "outdoor",
  "other",
];
