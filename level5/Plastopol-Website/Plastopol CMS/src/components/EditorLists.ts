// src/components/EditorLists.ts
// Editable lists for: features (bullet items) and specifications (key/value rows)

import type { Product, Specification } from "../lib/types";

export function renderEditorLists(container: HTMLElement, product: Product) {
  container.innerHTML = `
    <div class="field-group">
      <label>Features</label>
      <div id="features-list" class="list-editor"></div>
      <button class="btn-add" id="add-feature">+ Add Feature</button>
    </div>
    <div class="field-group">
      <label>Specifications</label>
      <div class="spec-table-header">
        <span>Key</span><span>Value</span><span></span>
      </div>
      <div id="specs-list" class="list-editor"></div>
      <button class="btn-add" id="add-spec">+ Add Specification</button>
    </div>
  `;

  renderFeatures(container, product.features);
  renderSpecs(container, product.specifications);

  container.querySelector("#add-feature")!.addEventListener("click", () => {
    appendFeatureRow(container, "");
    emitChange(container);
  });

  container.querySelector("#add-spec")!.addEventListener("click", () => {
    appendSpecRow(container, { key: "", value: "" });
    emitChange(container);
  });
}

function renderFeatures(container: HTMLElement, features: string[]) {
  const list = container.querySelector<HTMLElement>("#features-list")!;
  list.innerHTML = "";
  features.forEach(f => appendFeatureRow(container, f));
}

function appendFeatureRow(container: HTMLElement, value: string) {
  const list = container.querySelector<HTMLElement>("#features-list")!;
  const row = document.createElement("div");
  row.className = "list-row";
  row.innerHTML = `
    <input class="input flex-1 feature-input" value="${esc(value)}" placeholder="Feature description" />
    <button class="btn-remove" title="Remove">✕</button>
  `;
  row.querySelector(".btn-remove")!.addEventListener("click", () => {
    row.remove();
    emitChange(container);
  });
  row.querySelector("input")!.addEventListener("input", () => emitChange(container));
  list.appendChild(row);
}

function renderSpecs(container: HTMLElement, specs: Specification[]) {
  const list = container.querySelector<HTMLElement>("#specs-list")!;
  list.innerHTML = "";
  specs.forEach(s => appendSpecRow(container, s));
}

function appendSpecRow(container: HTMLElement, spec: Specification) {
  const list = container.querySelector<HTMLElement>("#specs-list")!;
  const row = document.createElement("div");
  row.className = "list-row";
  row.innerHTML = `
    <input class="input flex-1 spec-key" value="${esc(spec.key)}" placeholder="Key" />
    <input class="input flex-1 spec-val" value="${esc(spec.value)}" placeholder="Value" />
    <button class="btn-remove" title="Remove">✕</button>
  `;
  row.querySelector(".btn-remove")!.addEventListener("click", () => {
    row.remove();
    emitChange(container);
  });
  row.querySelectorAll("input").forEach(i => i.addEventListener("input", () => emitChange(container)));
  list.appendChild(row);
}

export function readEditorLists(container: HTMLElement): Pick<Product, "features" | "specifications"> {
  const features = Array.from(
    container.querySelectorAll<HTMLInputElement>(".feature-input")
  ).map(i => i.value.trim()).filter(Boolean);

  const specifications: Specification[] = Array.from(
    container.querySelectorAll<HTMLElement>(".list-row")
  ).filter(row => row.querySelector(".spec-key"))
   .map(row => ({
     key: row.querySelector<HTMLInputElement>(".spec-key")!.value.trim(),
     value: row.querySelector<HTMLInputElement>(".spec-val")!.value.trim(),
   }))
   .filter(s => s.key || s.value);

  return { features, specifications };
}

function emitChange(container: HTMLElement) {
  container.dispatchEvent(new CustomEvent("lists:change", { bubbles: true }));
}

function esc(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
