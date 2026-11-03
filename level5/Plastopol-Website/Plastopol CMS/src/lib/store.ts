// src/lib/store.ts

import type { AppState, Product, CmsConfig, BuildStatus, PreviewStatus } from "./types";

type Listener = (state: AppState) => void;

const listeners: Listener[] = [];

export const state: AppState = {
  config: null,
  products: [],
  selectedId: null,
  pendingNewProduct: null,
  unsaved: false,
  buildStatus: "idle",
  buildMessage: "",
  previewStatus: "idle",
  previewUrl: "",
};

export function subscribe(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notify() {
  listeners.forEach((fn) => fn({ ...state }));
}

export function setConfig(config: CmsConfig) {
  state.config = config;
  notify();
}

export function setProducts(products: Product[]) {
  state.products = products;
  notify();
}

export function setSelectedId(id: string | null) {
  // Navigating away from a pending new product discards it without touching
  // the saved product list, so autosave never writes an empty shell.
  if (state.pendingNewProduct && id !== state.pendingNewProduct.id) {
    state.pendingNewProduct = null;
  }
  state.selectedId = id;
  notify();
}

export function setUnsaved(v: boolean) {
  state.unsaved = v;
  notify();
}

export function setBuildStatus(status: BuildStatus, message = "") {
  state.buildStatus = status;
  state.buildMessage = message;
  notify();
}

export function setPreviewStatus(status: PreviewStatus, url = "") {
  state.previewStatus = status;
  state.previewUrl = url;
  notify();
}

/**
 * Stage a brand-new product without adding it to `products[]` yet.
 * The editor will detect this via `state.pendingNewProduct` and only call
 * `upsertProduct` when the user explicitly clicks Save.
 */
export function setPendingNew(product: Product) {
  state.pendingNewProduct = product;
  state.selectedId = product.id;
  notify();
}

/**
 * Discard the pending-new draft without persisting anything.
 */
export function clearPendingNew() {
  state.pendingNewProduct = null;
  state.selectedId = null;
  notify();
}

export function upsertProduct(product: Product) {
  // Clear the pending-new slot when the product is committed for the first time.
  if (state.pendingNewProduct?.id === product.id) {
    state.pendingNewProduct = null;
  }

  const idx = state.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    state.products[idx] = product;
  } else {
    state.products.push(product);
  }
  state.unsaved = true;
  notify();
}

export function removeProduct(id: string) {
  state.products = state.products.filter((p) => p.id !== id);
  state.selectedId = state.selectedId === id ? null : state.selectedId;
  state.unsaved = true;
  notify();
}

export function getSelected(): Product | null {
  // Return the pending-new draft if it matches the selected id, so the editor
  // can render it before it has been committed to the product list.
  if (state.pendingNewProduct && state.selectedId === state.pendingNewProduct.id) {
    return state.pendingNewProduct;
  }
  return state.products.find((p) => p.id === state.selectedId) ?? null;
}
