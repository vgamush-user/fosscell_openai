// src/lib/autosave.ts
// Debounced autosave to products.json. Does NOT git commit.

import { state } from "./store";
import { writeProducts } from "./tauri";

let timer: ReturnType<typeof setTimeout> | null = null;
const DELAY_MS = 3000;

export function scheduleAutosave() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    runSave();
  }, DELAY_MS);
}

export function cancelAutosave() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

async function runSave() {
  const { config, products } = state;
  if (!config?.repo_path) return;

  try {
    const json = JSON.stringify(products, null, 2);
    await writeProducts(config.repo_path, json);
    updateSaveIndicator("saved");
  } catch (err) {
    updateSaveIndicator("error");
    console.error("Autosave failed:", err);
  }
}

function updateSaveIndicator(status: "saved" | "error") {
  const el = document.getElementById("save-indicator");
  if (!el) return;
  if (status === "saved") {
    el.textContent = "✓ Saved locally";
    el.className = "save-indicator save-ok";
  } else {
    el.textContent = "✗ Save failed";
    el.className = "save-indicator save-err";
  }
}

export function markUnsaved() {
  const el = document.getElementById("save-indicator");
  if (el) {
    el.textContent = "● Unsaved changes";
    el.className = "save-indicator save-pending";
  }
}
