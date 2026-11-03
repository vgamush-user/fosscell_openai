// src/components/ImageManager.ts

import type { Product } from "../lib/types";
import { writeImageBytes, deleteImage } from "../lib/tauri";
import { makeImageFilename } from "../lib/product";
import { state } from "../lib/store";
import { cmsLog, cmsErr } from "../lib/logger";

export function renderImageManager(container: HTMLElement, product: Product) {
  container.innerHTML = `
    <div class="field-group">
      <label>Images</label>
      <div id="drop-zone" class="drop-zone">
        <span>Drag &amp; drop images here, or <label class="file-link">
          browse<input id="file-input" type="file" accept="image/*" multiple hidden />
        </label></span>
      </div>
      <div id="image-grid" class="image-grid"></div>
    </div>
  `;

  renderGrid(container, product);
  wireDropZone(container, product);

  container.querySelector<HTMLInputElement>("#file-input")!
    .addEventListener("change", async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) await handleFiles(container, product, Array.from(files));
    });
}

function renderGrid(container: HTMLElement, product: Product) {
  const grid = container.querySelector<HTMLElement>("#image-grid")!;
  grid.innerHTML = "";

  if (product.images.length === 0) {
    grid.innerHTML = `<p class="empty-state">No images yet</p>`;
    return;
  }

  product.images.forEach((filename, idx) => {
    const isThumbnail = filename === product.thumbnail;
    const repoPath = state.config?.repo_path ?? "";
    const card = document.createElement("div");
    card.className = `image-card ${isThumbnail ? "is-thumbnail" : ""}`;
    card.innerHTML = `
      <img src="asset://${repoPath}/website/public/images/products/${filename}" alt="${filename}" />
      <div class="image-card-name">${filename}</div>
      <div class="image-card-actions">
        <button class="btn-sm ${isThumbnail ? "active" : ""}" data-action="thumb" data-idx="${idx}">
          ${isThumbnail ? "★ Thumb" : "☆ Set Thumb"}
        </button>
        <button class="btn-sm danger" data-action="delete" data-idx="${idx}">✕</button>
      </div>
    `;
    card.querySelector("[data-action='thumb']")!.addEventListener("click", () => {
      product.thumbnail = filename;
      emitChange(container, product);
      renderGrid(container, product);
    });
    card.querySelector("[data-action='delete']")!.addEventListener("click", async () => {
      if (!confirm(`Delete ${filename}?`)) return;
      await deleteImage(repoPath, filename);
      product.images.splice(idx, 1);
      if (product.thumbnail === filename) product.thumbnail = product.images[0] ?? "";
      emitChange(container, product);
      renderGrid(container, product);
    });
    grid.appendChild(card);
  });
}

function wireDropZone(container: HTMLElement, product: Product) {
  const zone = container.querySelector<HTMLElement>("#drop-zone")!;
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", async (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer?.files ?? []);
    await handleFiles(container, product, files);
  });
}

async function handleFiles(container: HTMLElement, product: Product, files: File[]) {
  const repoPath = state.config?.repo_path ?? "";
  if (!repoPath) return alert("No repo configured.");

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const idx = product.images.length;
    const filename = makeImageFilename(product.slug || "product", idx);
    cmsLog("ImageManager", "writing image:", filename, "size:", file.size);
    try {
      // Use base64 transfer — works in Tauri v2 where File.path is unavailable
      await writeImageBytes(repoPath, filename, file);
      product.images.push(filename);
      if (!product.thumbnail) product.thumbnail = filename;
      cmsLog("ImageManager", "image written OK:", filename);
    } catch (err) {
      cmsErr("ImageManager", "failed to write image:", filename, String(err));
      alert(`Failed to save image ${filename}:\n${err}`);
    }
  }

  emitChange(container, product);
  renderGrid(container, product);
}

function emitChange(container: HTMLElement, product: Product) {
  container.dispatchEvent(new CustomEvent("images:change", {
    bubbles: true,
    detail: { images: [...product.images], thumbnail: product.thumbnail },
  }));
}