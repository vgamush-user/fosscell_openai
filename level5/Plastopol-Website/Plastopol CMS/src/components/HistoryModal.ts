// src/components/HistoryModal.ts

import { gitLog, gitRevertLast } from "../lib/tauri";
import { state } from "../lib/store";
import type { CommitEntry } from "../lib/types";

export function mountHistoryModal(appRoot: HTMLElement) {
  const modal = document.createElement("div");
  modal.id = "history-modal";
  modal.className = "modal hidden";
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <div class="modal-header">
        <h2>Commit History</h2>
        <button class="modal-close" id="history-close">✕</button>
      </div>
      <div class="modal-body">
        <div id="history-list" class="history-list">
          <p class="empty-state">Loading…</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn danger" id="btn-revert">↩ Revert Last Commit</button>
        <button class="btn secondary" id="btn-refresh-log">↻ Refresh</button>
      </div>
    </div>
  `;
  appRoot.appendChild(modal);

  modal.querySelector("#history-close")!.addEventListener("click", hide);
  modal.querySelector(".modal-backdrop")!.addEventListener("click", hide);
  modal.querySelector("#btn-refresh-log")!.addEventListener("click", load);
  modal.querySelector("#btn-revert")!.addEventListener("click", onRevert);

  document.addEventListener("cms:show-history", () => show());
}

function show() {
  const modal = document.getElementById("history-modal")!;
  modal.classList.remove("hidden");
  load();
}

function hide() {
  document.getElementById("history-modal")!.classList.add("hidden");
}

async function load() {
  const list = document.getElementById("history-list")!;
  list.innerHTML = `<p class="empty-state">Loading…</p>`;

  const repoPath = state.config?.repo_path;
  if (!repoPath) {
    list.innerHTML = `<p class="empty-state error">No repo configured.</p>`;
    return;
  }

  try {
    const entries: CommitEntry[] = await gitLog(repoPath);
    if (entries.length === 0) {
      list.innerHTML = `<p class="empty-state">No commits yet.</p>`;
      return;
    }
    list.innerHTML = entries.map(renderEntry).join("");
  } catch (err) {
    list.innerHTML = `<p class="empty-state error">Error: ${err}</p>`;
  }
}

function renderEntry(entry: CommitEntry): string {
  return `
    <div class="history-entry">
      <div class="history-msg">${escHtml(entry.message)}</div>
      <div class="history-meta">
        <code class="history-hash">${entry.hash.slice(0, 7)}</code>
        <span class="history-date">${entry.date}</span>
      </div>
    </div>
  `;
}

async function onRevert() {
  const repoPath = state.config?.repo_path;
  if (!repoPath) return;
  if (!confirm("Revert the last commit? This creates a new revert commit.")) return;
  try {
    await gitRevertLast(repoPath);
    alert("Reverted successfully.");
    load();
  } catch (err) {
    alert("Revert failed:\n" + err);
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
