// src/components/Sidebar.ts

import { state, setSelectedId, subscribe } from "../lib/store";
import { searchProducts, highlightText } from "../lib/search";
import type { Product } from "../lib/types";
import { cmsLog } from "../lib/logger";

const STATUS_COLORS: Record<string, string> = {
  active:   "#16a34a",
  draft:    "#d97706",
  archived: "#6b7280",
};

export function renderSidebar(container: HTMLElement) {
  container.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">Products</span>
        <button id="add-product-btn" class="btn-icon" title="Add product">＋</button>
      </div>
      <input id="search-input" class="search-input" placeholder="Search products…" />
      <div id="product-list" class="product-list"></div>
    </div>
  `;

  const searchInput = container.querySelector<HTMLInputElement>("#search-input")!;
  const addBtn = container.querySelector<HTMLButtonElement>("#add-product-btn")!;

  searchInput.addEventListener("input", () => renderList(searchInput.value));
  addBtn.addEventListener("click", () => {
    cmsLog("Sidebar", "+ button clicked — dispatching cms:add-product");
    document.dispatchEvent(new CustomEvent("cms:add-product"));
  });

  subscribe((newState) => {
    cmsLog("Sidebar", "store notify — products:", newState.products.length, "selectedId:", newState.selectedId ?? "null");
    renderList(searchInput.value);
  });

  renderList("");

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

function renderList(query: string) {
  const list = document.getElementById("product-list");
  if (!list) return;

  const matches = searchProducts(state.products, query);
  cmsLog("Sidebar", "renderList — state.products:", state.products.length, "matches:", matches.length, "query:", JSON.stringify(query));

  if (matches.length === 0) {
    list.innerHTML = `<div class="empty-state">No products found</div>`;
    return;
  }

  list.innerHTML = matches
    .map(({ product }) => renderItem(product, query))
    .join("");

  list.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest(".item-actions")) return;
      const id = el.dataset.id!;
      cmsLog("Sidebar", "row clicked, id:", id);
      setSelectedId(id);
    });

    el.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const { action, id } = btn.dataset as { action: string; id: string };
        cmsLog("Sidebar", "action btn clicked:", action, "id:", id);
        document.dispatchEvent(new CustomEvent(`cms:${action}-product`, { detail: { id } }));
      });
    });
  });
}

function renderItem(product: Product, query: string): string {
  const active = state.selectedId === product.id ? "selected" : "";
  const color  = STATUS_COLORS[product.status] ?? "#6b7280";
  const name   = highlightText(product.modelName || "(Unnamed)", query);

  return `
    <div class="product-item ${active}" data-id="${product.id}">
      <div class="product-item-main">
        <span class="product-item-name">${name}</span>
        <span class="status-dot" style="background:${color}" title="${product.status}"></span>
      </div>
      <div class="product-item-sub">${product.category} · ${product.status}</div>
      <div class="item-actions">
        <button class="action-btn" data-action="edit" data-id="${product.id}">Edit</button>
        <button class="action-btn danger" data-action="delete" data-id="${product.id}">Delete</button>
      </div>
    </div>
  `;
}
