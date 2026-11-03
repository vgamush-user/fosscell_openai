// src/components/ProductEditor.ts

import type { Product } from "../lib/types";
import { upsertProduct, getSelected, subscribe, state } from "../lib/store";
import { scheduleAutosave, markUnsaved } from "../lib/autosave";
import { validateProduct, generateUniqueSlug } from "../lib/product";
import { renderEditorFields, readEditorFields } from "./EditorFields";
import { renderEditorLists, readEditorLists } from "./EditorLists";
import { renderImageManager } from "./ImageManager";
import { cmsLog, cmsWarn } from "../lib/logger";

export function mountProductEditor(container: HTMLElement) {
  subscribe(() => {
    const product = getSelected();
    cmsLog("ProductEditor", "store notify — selectedId:", state.selectedId ?? "null", "resolved:", product ? product.modelName : "null");
    if (!product) {
      renderEmpty(container);
    } else {
      renderEditor(container, product);
    }
  });
  renderEmpty(container);
}

function renderEmpty(container: HTMLElement) {
  cmsLog("ProductEditor", "renderEmpty()");
  container.innerHTML = `
    <div class="editor-empty">
      <p>Select a product from the sidebar, or add a new one.</p>
    </div>
  `;
}

function renderEditor(container: HTMLElement, product: Product) {
  cmsLog("ProductEditor", "renderEditor() — id:", product.id, "name:", product.modelName);

  // FIX: detect whether this is a pending-new product (not yet in products[]).
  // If it is, we must NOT schedule autosave on draft changes — the user hasn't
  // saved yet, so writing an empty shell would corrupt the file.
  const isNew = state.pendingNewProduct?.id === product.id;

  container.innerHTML = `
    <div class="editor-scroll">
      <div class="editor-section" id="section-fields"></div>
      <div class="editor-section" id="section-lists"></div>
      <div class="editor-section" id="section-images"></div>
      <div class="editor-section">
        <div id="validation-errors" class="validation-errors hidden"></div>
        <button class="btn primary full-width" id="btn-save-product">
          ${isNew ? "Create Product" : "Save Product"}
        </button>
      </div>
    </div>
  `;

  let draft: Product = structuredClone(product);

  const fieldsEl = container.querySelector<HTMLElement>("#section-fields")!;
  const listsEl  = container.querySelector<HTMLElement>("#section-lists")!;
  const imagesEl = container.querySelector<HTMLElement>("#section-images")!;

  cmsLog("ProductEditor", "sub-sections found — fields:", !!fieldsEl, "lists:", !!listsEl, "images:", !!imagesEl);

  renderEditorFields(fieldsEl, draft);
  renderEditorLists(listsEl, draft);
  renderImageManager(imagesEl, draft);

  container.addEventListener("fields:change", () => {
    Object.assign(draft, readEditorFields(fieldsEl));
    onDraftChange(isNew);
  });
  container.addEventListener("lists:change", () => {
    Object.assign(draft, readEditorLists(listsEl));
    onDraftChange(isNew);
  });
  container.addEventListener("images:change", (e: Event) => {
    const { images, thumbnail } = (e as CustomEvent).detail;
    draft.images = images;
    draft.thumbnail = thumbnail;
    onDraftChange(isNew);
  });

  container.querySelector("#btn-save-product")!.addEventListener("click", () => {
    cmsLog("ProductEditor", "Save Product clicked — draft id:", draft.id, "name:", draft.modelName, "isNew:", isNew);
    Object.assign(draft, readEditorFields(fieldsEl));
    Object.assign(draft, readEditorLists(listsEl));
    saveProduct(container, draft);
  });
}

function onDraftChange(isNew: boolean) {
  markUnsaved();
  // FIX: only schedule autosave for products that already exist in the store.
  // For pending-new products, we wait for the explicit Save click so that an
  // empty (or partially filled) product is never written to products.json.
  if (!isNew) {
    scheduleAutosave();
  }
}

function saveProduct(container: HTMLElement, draft: Product) {
  const otherSlugs = state.products
    .filter((p) => p.id !== draft.id)
    .map((p) => p.slug);
  draft.slug = generateUniqueSlug(draft.modelName, otherSlugs);

  const errors = validateProduct(draft, state.products);
  const errEl = container.querySelector<HTMLElement>("#validation-errors")!;

  if (errors.length) {
    cmsWarn("ProductEditor", "validation errors:", JSON.stringify(errors));
    errEl.innerHTML = errors.map(e => `<p>• ${e.message}</p>`).join("");
    errEl.classList.remove("hidden");
    return;
  }

  errEl.classList.add("hidden");
  cmsLog("ProductEditor", "upserting product:", draft.id);
  // upsertProduct also clears pendingNewProduct if this was a new product,
  // so the sidebar will render it as a normal committed item from here on.
  upsertProduct(draft);
  scheduleAutosave();
}
