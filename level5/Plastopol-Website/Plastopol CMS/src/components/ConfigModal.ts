// src/components/ConfigModal.ts

import { getConfig, saveConfig, pickFolder } from "../lib/tauri";
import { setConfig, state } from "../lib/store";
import type { CmsConfig } from "../lib/types";

export async function mountConfigModal(appRoot: HTMLElement): Promise<void> {
  const modal = document.createElement("div");
  modal.id = "config-modal";
  modal.className = "modal hidden";
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <div class="modal-header">
        <h2>CMS Settings</h2>
        <button class="modal-close" id="config-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>Website Repo Path</label>
          <div class="input-row">
            <input id="cfg-repo" class="input flex-1" placeholder="C:\\Users\\...\\Plastopol-Website-main" />
            <button class="btn secondary" id="cfg-browse">Browse…</button>
          </div>
        </div>
        <div class="field-group">
          <label>Production Branch</label>
          <input id="cfg-branch" class="input" value="main" />
        </div>
        <div class="field-group">
          <label>Preview Branch <span class="hint">(pushed on Preview click)</span></label>
          <input id="cfg-preview-branch" class="input" value="cms-preview" />
        </div>
        <div class="field-group">
          <label>Cloudflare Project Name <span class="hint">(for preview URL)</span></label>
          <input id="cfg-cf-project" class="input" placeholder="plastopol-website" />
        </div>
        <p id="cfg-error" class="error-msg hidden"></p>
      </div>
      <div class="modal-footer">
        <button class="btn primary" id="cfg-save">Save &amp; Continue</button>
      </div>
    </div>
  `;
  appRoot.appendChild(modal);

  modal.querySelector("#cfg-browse")!.addEventListener("click", async () => {
    const folder = await pickFolder();
    if (folder) {
      (modal.querySelector<HTMLInputElement>("#cfg-repo")!).value = folder;
    }
  });

  modal.querySelector("#cfg-save")!.addEventListener("click", () => onSave(modal));
  modal.querySelector("#config-close")!.addEventListener("click", () => hide(modal));
  modal.querySelector(".modal-backdrop")!.addEventListener("click", () => hide(modal));

  document.addEventListener("cms:open-settings", () => showWithCurrent(modal));

  await autoShowIfNeeded(modal);
}

async function autoShowIfNeeded(modal: HTMLElement) {
  try {
    const cfg = await getConfig();
    if (!cfg.repo_path) {
      showWithValues(modal, cfg);
    } else {
      setConfig(cfg);
    }
  } catch {
    showWithValues(modal, { repo_path: "", default_branch: "main", preview_branch: "cms-preview", cloudflare_project: "" });
  }
}

async function showWithCurrent(modal: HTMLElement) {
  const cfg = state.config ?? { repo_path: "", default_branch: "main", preview_branch: "cms-preview", cloudflare_project: "" };
  showWithValues(modal, cfg);
}

function showWithValues(modal: HTMLElement, cfg: CmsConfig) {
  (modal.querySelector<HTMLInputElement>("#cfg-repo")!).value = cfg.repo_path;
  (modal.querySelector<HTMLInputElement>("#cfg-branch")!).value = cfg.default_branch;
  (modal.querySelector<HTMLInputElement>("#cfg-preview-branch")!).value = cfg.preview_branch || "cms-preview";
  (modal.querySelector<HTMLInputElement>("#cfg-cf-project")!).value = cfg.cloudflare_project || "";
  modal.classList.remove("hidden");
}

function hide(modal: HTMLElement) {
  if (state.config?.repo_path) modal.classList.add("hidden");
}

async function onSave(modal: HTMLElement) {
  const repo          = modal.querySelector<HTMLInputElement>("#cfg-repo")!.value.trim();
  const branch        = modal.querySelector<HTMLInputElement>("#cfg-branch")!.value.trim() || "main";
  const previewBranch = modal.querySelector<HTMLInputElement>("#cfg-preview-branch")!.value.trim() || "cms-preview";
  const cfProject     = modal.querySelector<HTMLInputElement>("#cfg-cf-project")!.value.trim();
  const errEl         = modal.querySelector<HTMLElement>("#cfg-error")!;

  if (!repo) {
    errEl.textContent = "Repo path is required.";
    errEl.classList.remove("hidden");
    return;
  }

  errEl.classList.add("hidden");
  const cfg: CmsConfig = { repo_path: repo, default_branch: branch, preview_branch: previewBranch, cloudflare_project: cfProject };

  try {
    await saveConfig(cfg);
    setConfig(cfg);
    modal.classList.add("hidden");
    document.dispatchEvent(new CustomEvent("cms:config-saved", { detail: cfg }));
  } catch (err) {
    errEl.textContent = "Failed to save: " + err;
    errEl.classList.remove("hidden");
  }
}