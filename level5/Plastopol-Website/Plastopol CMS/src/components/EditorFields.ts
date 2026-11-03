// src/components/EditorFields.ts
// Renders: modelName, slug, status, category, inStock, leadTime, description, colors, tags

import type { Product } from "../lib/types";
import { slugify, CATEGORIES } from "../lib/product";

export function renderEditorFields(container: HTMLElement, product: Product) {
  container.innerHTML = `
    <div class="field-group">
      <label>Model Name</label>
      <input id="f-name" class="input" value="${esc(product.modelName)}" />
    </div>
    <div class="field-row">
      <div class="field-group flex-1">
        <label>Slug</label>
        <input id="f-slug" class="input mono" value="${esc(product.slug)}" />
      </div>
      <div class="field-group w-160">
        <label>Status</label>
        <select id="f-status" class="input">
          ${["active","draft","archived"].map(s =>
            `<option value="${s}" ${product.status===s?"selected":""}>${s}</option>`
          ).join("")}
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field-group flex-1">
        <label>Category</label>
        <select id="f-category" class="input">
          ${CATEGORIES.map(c =>
            `<option value="${c}" ${product.category===c?"selected":""}>${c}</option>`
          ).join("")}
        </select>
      </div>
      <div class="field-group w-160">
        <label>Lead Time</label>
        <input id="f-lead" class="input" value="${esc(product.leadTime)}" />
      </div>
      <div class="field-group w-120">
        <label>In Stock</label>
        <label class="toggle">
          <input id="f-instock" type="checkbox" ${product.inStock?"checked":""} />
          <span class="toggle-track"></span>
        </label>
      </div>
    </div>
    <div class="field-group">
      <label>Description</label>
      <textarea id="f-desc" class="input textarea" rows="3">${esc(product.description)}</textarea>
    </div>
    <div class="field-group">
      <label>Colors <span class="hint">(comma-separated)</span></label>
      <input id="f-colors" class="input" value="${esc(product.colors.join(", "))}" />
    </div>
    <div class="field-group">
      <label>Tags <span class="hint">(comma-separated)</span></label>
      <input id="f-tags" class="input" value="${esc(product.tags.join(", "))}" />
    </div>
  `;

  // Slug is "locked" if it exists and doesn't match what auto-generation
  // would have produced — meaning the user has manually edited it.
  let slugLocked =
    product.slug !== "" && product.slug !== slugify(product.modelName);

  const nameInput = container.querySelector<HTMLInputElement>("#f-name")!;
  const slugInput = container.querySelector<HTMLInputElement>("#f-slug")!;

  nameInput.addEventListener("input", () => {
    if (!slugLocked) slugInput.value = slugify(nameInput.value);
    emitChange(container);
  });
  slugInput.addEventListener("input", () => {
    slugLocked = true;
    emitChange(container);
  });

  container.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.id !== "f-name" && el.id !== "f-slug")
      el.addEventListener("input", () => emitChange(container));
    el.addEventListener("change", () => emitChange(container));
  });
}

export function readEditorFields(container: HTMLElement): Partial<Product> {
  const v = <T extends HTMLElement>(id: string) => container.querySelector<T>(id)!;
  return {
    modelName:   v<HTMLInputElement>("#f-name").value.trim(),
    slug:        v<HTMLInputElement>("#f-slug").value.trim(),
    status:      v<HTMLSelectElement>("#f-status").value as Product["status"],
    category:    v<HTMLSelectElement>("#f-category").value as Product["category"],
    leadTime:    v<HTMLInputElement>("#f-lead").value.trim(),
    inStock:     v<HTMLInputElement>("#f-instock").checked,
    description: v<HTMLTextAreaElement>("#f-desc").value.trim(),
    colors:      splitTrim(v<HTMLInputElement>("#f-colors").value),
    tags:        splitTrim(v<HTMLInputElement>("#f-tags").value),
  };
}

function emitChange(container: HTMLElement) {
  container.dispatchEvent(new CustomEvent("fields:change", { bubbles: true }));
}

function splitTrim(val: string): string[] {
  return val.split(",").map(s => s.trim()).filter(Boolean);
}

function esc(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
