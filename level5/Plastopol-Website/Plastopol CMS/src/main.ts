// src/main.ts
import { mountConfigModal } from "./components/ConfigModal";
import { renderSidebar } from "./components/Sidebar";
import { mountProductEditor } from "./components/ProductEditor";
import { renderActionBar } from "./components/ActionBar";
import { mountHistoryModal } from "./components/HistoryModal";
import { state, setProducts, setSelectedId, removeProduct, setPendingNew } from "./lib/store";
import { readProducts } from "./lib/tauri";
import { emptyProduct } from "./lib/product";
import { cmsLog, cmsWarn, cmsErr } from "./lib/logger";

window.addEventListener("DOMContentLoaded", async () => {
  cmsLog("main", "DOMContentLoaded fired");

  const root = document.getElementById("app")!;

  root.innerHTML = `
    <div id="sidebar-pane"></div>
    <div id="editor-pane"></div>
    <div id="action-bar-pane"></div>
  `;

  mountDeleteModal(root);

  document.addEventListener("cms:add-product", () => {
    cmsLog("main", "cms:add-product received");
    const p = emptyProduct();
    cmsLog("main", "new empty product staged (pending), id:", p.id);
    // FIX: stage as pending-new instead of immediately inserting into the store.
    // This prevents autosave from writing an empty shell and removes the false
    // "duplicate ID" error that blocked all saves on pre-existing objects.
    setPendingNew(p);
    cmsLog("main", "setPendingNew done, selectedId:", state.selectedId);
  });

  document.addEventListener("cms:edit-product", (e: Event) => {
    const { id } = (e as CustomEvent).detail;
    cmsLog("main", "cms:edit-product received, id:", id);
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(".editor-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.addEventListener("cms:delete-product", (e: Event) => {
    const { id } = (e as CustomEvent).detail;
    cmsLog("main", "cms:delete-product received, id:", id);
    showDeleteModal(id);
  });

  document.addEventListener("cms:config-saved", () => {
    cmsLog("main", "cms:config-saved received — state.config:", JSON.stringify(state.config));
    loadProducts();
  });

  cmsLog("main", "mounting ConfigModal...");
  await mountConfigModal(root);
  cmsLog("main", "ConfigModal mounted. state.config:", JSON.stringify(state.config));

  mountHistoryModal(root);

  renderSidebar(document.getElementById("sidebar-pane")!);
  cmsLog("main", "Sidebar rendered");

  mountProductEditor(document.getElementById("editor-pane")!);
  cmsLog("main", "ProductEditor mounted");

  renderActionBar(document.getElementById("action-bar-pane")!);
  cmsLog("main", "ActionBar rendered");

  if (state.config?.repo_path) {
    cmsLog("main", "config already present on startup, repo:", state.config.repo_path);
    await loadProducts();
  } else {
    cmsWarn("main", "no repo_path in config at startup — waiting for cms:config-saved");
  }

  window.addEventListener("beforeunload", (e) => {
    if (state.unsaved) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
});

function mountDeleteModal(root: HTMLElement) {
  const el = document.createElement("div");
  el.id = "delete-modal";
  el.className = "modal hidden";
  el.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-box" style="width:360px">
      <div class="modal-header">
        <h2>Delete product?</h2>
        <button class="modal-close" id="delete-cancel-x">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--text-dim)">
          This will remove the product from the list. The change won't be
          committed until you push.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn secondary" id="delete-cancel">Cancel</button>
        <button class="btn danger"    id="delete-confirm">Delete</button>
      </div>
    </div>
  `;
  root.appendChild(el);

  const close = () => el.classList.add("hidden");
  el.querySelector("#delete-cancel-x")!.addEventListener("click", close);
  el.querySelector("#delete-cancel")!.addEventListener("click", close);
  el.querySelector(".modal-backdrop")!.addEventListener("click", close);

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  { e.preventDefault(); (el.querySelector("#delete-confirm") as HTMLButtonElement).click(); }
    if (e.key === "Escape") { e.preventDefault(); close(); }
  });
}

function showDeleteModal(id: string) {
  const el = document.getElementById("delete-modal")!;
  el.classList.remove("hidden");

  const confirmBtn = el.querySelector<HTMLButtonElement>("#delete-confirm")!;
  const fresh = confirmBtn.cloneNode(true) as HTMLButtonElement;
  confirmBtn.replaceWith(fresh);

  fresh.addEventListener("click", () => {
    cmsLog("main", "delete confirmed for id:", id);
    removeProduct(id);
    el.classList.add("hidden");
  });

  fresh.focus();
}

async function loadProducts() {
  const repoPath = state.config?.repo_path;
  cmsLog("loadProducts", "called. repoPath:", repoPath ?? "UNDEFINED");

  if (!repoPath) {
    cmsWarn("loadProducts", "aborting — no repoPath");
    return;
  }

  try {
    cmsLog("loadProducts", "invoking readProducts via Tauri...");
    const raw = await readProducts(repoPath);
    cmsLog("loadProducts", "readProducts returned. raw length:", raw?.length ?? "NULL", "preview:", raw?.slice(0, 150));

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      cmsErr("loadProducts", "JSON.parse FAILED:", parseErr, "raw was:", raw?.slice(0, 300));
      return;
    }

    if (!Array.isArray(parsed)) {
      cmsErr("loadProducts", "parsed value is NOT an array. type:", typeof parsed, "value:", JSON.stringify(parsed).slice(0, 200));
      return;
    }

    cmsLog("loadProducts", "product count:", parsed.length, "first item:", JSON.stringify(parsed[0]).slice(0, 100));
    setProducts(parsed);
    cmsLog("loadProducts", "setProducts done. state.products.length:", state.products.length);
  } catch (err) {
    cmsErr("loadProducts", "Tauri invoke FAILED:", String(err));
  }
}
