// src/components/ActionBar.ts

import { state, subscribe, setBuildStatus, setPreviewStatus } from "../lib/store";
import { gitCommitPush, gitPull, gitPreviewPush, writeProducts } from "../lib/tauri";
import { validateProduct } from "../lib/product";
import { cmsLog, cmsErr } from "../lib/logger";

// Cloudflare Pages preview URL format:
// https://<branch-slug>.<project>.pages.dev
// Branch "cms-preview" becomes "cms-preview" in the URL
function buildPreviewUrl(project: string, branch: string): string {
  const branchSlug = branch.replace(/\//g, "-");
  return `https://${branchSlug}.${project}.pages.dev`;
}

export function renderActionBar(container: HTMLElement) {
  container.innerHTML = `
    <div class="action-bar">
      <div class="action-left">
        <button id="btn-settings" class="btn-settings" title="Change repo path">⚙ Repo</button>
        <span id="save-indicator" class="save-indicator">—</span>
      </div>
      <div class="action-center">
        <input id="commit-msg" class="commit-input" placeholder="Commit message…" value="Update products" />
      </div>
      <div class="action-right">
        <button id="btn-pull"    class="btn secondary">↓ Pull</button>
        <button id="btn-preview" class="btn secondary">⧉ Preview</button>
        <button id="btn-history" class="btn secondary">History</button>
        <button id="btn-build"   class="btn primary">↑ Build &amp; Push</button>
      </div>
    </div>
  `;

  document.getElementById("btn-build")!.addEventListener("click", onBuild);
  document.getElementById("btn-pull")!.addEventListener("click", onPull);
  document.getElementById("btn-preview")!.addEventListener("click", onPreview);
  document.getElementById("btn-settings")!.addEventListener("click", () => {
    cmsLog("ActionBar", "⚙ Repo clicked");
    document.dispatchEvent(new CustomEvent("cms:open-settings"));
  });
  document.getElementById("btn-history")!.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("cms:show-history"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") onBuild();
  });

  subscribe(updateButtons);
}

function updateButtons() {
  updateBuildButton();
  updatePreviewButton();
}

function updateBuildButton() {
  const buildBtn = document.getElementById("btn-build") as HTMLButtonElement | null;
  if (!buildBtn) return;

  const { buildStatus } = state;
  buildBtn.disabled = buildStatus === "building";
  buildBtn.textContent = getBuildButtonText(buildStatus);
}

function getBuildButtonText(status: string): string {
  switch (status) {
    case "building":
      return "Building…";
    case "success":
      return "✓ Pushed!";
    case "error":
      return "✗ Error";
    default:
      return "↑ Build & Push";
  }
}

function updatePreviewButton() {
  const previewBtn = document.getElementById("btn-preview") as HTMLButtonElement | null;
  if (!previewBtn) return;

  const { previewStatus, previewUrl } = state;
  previewBtn.disabled = previewStatus === "pushing";
  previewBtn.textContent = getPreviewButtonText(previewStatus);
  previewBtn.onclick = getPreviewButtonHandler(previewStatus, previewUrl);
}

function getPreviewButtonText(status: string): string {
  switch (status) {
    case "pushing":
      return "Pushing…";
    case "building":
      return "Building…";
    case "ready":
      return "⧉ View Preview";
    case "error":
      return "✗ Preview Failed";
    default:
      return "⧉ Preview";
  }
}

function getPreviewButtonHandler(status: string, url: string | null): () => void {
  if (status === "ready" && url) {
    return () => window.open(url, "_blank");
  }
  return () => onPreview();
}

async function onBuild() {
  cmsLog("ActionBar", "Build & Push clicked");
  const { config, products } = state;
  if (!config?.repo_path) return alert("No repo configured.");

  const errors = products.flatMap((p) => validateProduct(p, products));
  if (errors.length) {
    alert("Validation errors:\n" + errors.map((e) => e.message).join("\n"));
    return;
  }

  const msgEl = document.getElementById("commit-msg") as HTMLInputElement;
  const message = msgEl.value.trim() || "Update products";

  setBuildStatus("building");
  try {
    cmsLog("ActionBar", "writeProducts, repo:", config.repo_path);
    const json = JSON.stringify(products, null, 2);
    await writeProducts(config.repo_path, json);
    cmsLog("ActionBar", "gitCommitPush, branch:", config.default_branch);
    await gitCommitPush(config.repo_path, message, config.default_branch);
    cmsLog("ActionBar", "push OK");
    setBuildStatus("success", "Pushed successfully");
    setTimeout(() => setBuildStatus("idle"), 4000);
  } catch (err: any) {
    cmsErr("ActionBar", "Build failed:", String(err));
    setBuildStatus("error", String(err));
    alert("Build failed:\n" + err);
  }
}

async function onPull() {
  cmsLog("ActionBar", "Pull clicked. config:", JSON.stringify(state.config));
  const { config } = state;
  if (!config?.repo_path) return alert("No repo configured.");

  const btn = document.getElementById("btn-pull") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Pulling…";

  try {
    cmsLog("ActionBar", "calling gitPull(), repo:", config.repo_path);
    const out = await gitPull(config.repo_path, config.default_branch);
    cmsLog("ActionBar", "gitPull() succeeded:", out);
    document.dispatchEvent(new CustomEvent("cms:config-saved"));
    alert("Pull complete:\n" + out);
  } catch (err) {
    cmsErr("ActionBar", "gitPull() FAILED:", String(err));
    alert("Pull failed:\n" + err);
  } finally {
    btn.disabled = false;
    btn.textContent = "↓ Pull";
  }
}

async function onPreview() {
  cmsLog("ActionBar", "Preview clicked");
  const { config, products } = state;
  if (!config?.repo_path) return alert("No repo configured.");
  if (!config.preview_branch) return alert("No preview branch configured. Set it in ⚙ Repo settings.");
  if (!config.cloudflare_project) return alert("No Cloudflare project name configured. Set it in ⚙ Repo settings.");

  const selectedProduct = products.find(p => p.id === state.selectedId);
  const productName = selectedProduct?.modelName || "products";

  setPreviewStatus("pushing");
  try {
    // Write current products.json first
    cmsLog("ActionBar", "writeProducts for preview");
    const json = JSON.stringify(products, null, 2);
    await writeProducts(config.repo_path, json);

    // Push to preview branch (force push — keeps it clean)
    cmsLog("ActionBar", "gitPreviewPush to branch:", config.preview_branch);
    await gitPreviewPush(config.repo_path, productName, config.preview_branch);
    cmsLog("ActionBar", "preview push OK — Cloudflare build triggered");

    // Build the expected preview URL
    const url = buildPreviewUrl(config.cloudflare_project, config.preview_branch);
    cmsLog("ActionBar", "preview URL:", url);

    // Show building state, then flip to ready after a delay
    // Cloudflare Pages typically builds in 60-120s — we open the URL and let CF show build status
    setPreviewStatus("building", url);

    // Wait 5s then mark ready so the button becomes "View Preview"
    setTimeout(() => {
      setPreviewStatus("ready", url);
      // Auto-open in browser
      window.open(url, "_blank");
    }, 5000);

  } catch (err) {
    cmsErr("ActionBar", "Preview push FAILED:", String(err));
    setPreviewStatus("error");
    alert("Preview push failed:\n" + err);
  }
}