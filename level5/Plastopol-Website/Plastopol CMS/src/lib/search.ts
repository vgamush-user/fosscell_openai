// src/lib/search.ts

import type { Product } from "./types";

export interface SearchMatch {
  product: Product;
  fields: string[]; // which fields matched
}

export function searchProducts(
  products: Product[],
  query: string
): SearchMatch[] {
  const q = query.toLowerCase().trim();
  if (!q) return products.map((p) => ({ product: p, fields: [] }));

  const results: SearchMatch[] = [];

  for (const product of products) {
    const fields: string[] = [];

    if (product.modelName.toLowerCase().includes(q)) fields.push("modelName");
    if (product.description.toLowerCase().includes(q)) fields.push("description");
    if (product.category.toLowerCase().includes(q)) fields.push("category");
    if (product.tags.some((t) => t.toLowerCase().includes(q))) fields.push("tags");
    if (product.slug.toLowerCase().includes(q)) fields.push("slug");

    if (fields.length > 0) results.push({ product, fields });
  }

  return results;
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = escapeRegex(query.trim());
  const re = new RegExp(escaped, "gi");
  let result = "";
  let lastIndex = 0;
  // Match raw text so searches cannot split HTML entities created by escaping.
  for (const match of text.matchAll(re)) {
    const index = match.index!;
    result += escapeHtml(text.slice(lastIndex, index));
    result += `<mark>${escapeHtml(match[0])}</mark>`;
    lastIndex = index + match[0].length;
  }
  return result + escapeHtml(text.slice(lastIndex));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
