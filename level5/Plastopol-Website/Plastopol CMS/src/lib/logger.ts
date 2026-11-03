// src/lib/logger.ts
// Writes to <repo_path>/cms-logs.txt via Rust invoke — no plugin-fs JS import needed.

import { invoke } from "@tauri-apps/api/core";
import { state } from "./store";

let queue: string[] = [];
let flushing = false;


export function log(level: "INFO" | "WARN" | "ERROR", tag: string, ...args: unknown[]) {
  const parts = args.map(a =>
    typeof a === "object" ? JSON.stringify(a) : String(a)
  );
  const line = `[${level}] [${tag}] ${parts.join(" ")}`;

  if (level === "ERROR") console.error(line);
  else if (level === "WARN") console.warn(line);
  else console.log(line);

  queue.push(line);
  scheduleFlush();
}

export const cmsLog  = (tag: string, ...a: unknown[]) => log("INFO",  tag, ...a);
export const cmsWarn = (tag: string, ...a: unknown[]) => log("WARN",  tag, ...a);
export const cmsErr  = (tag: string, ...a: unknown[]) => log("ERROR", tag, ...a);

function scheduleFlush() {
  if (flushing) return;
  flushing = true;
  setTimeout(flush, 400);
}

async function flush() {
  flushing = false;
  const repoPath = state.config?.repo_path;
  if (!repoPath || queue.length === 0) return;

  const batch = queue.splice(0, queue.length);
  for (const line of batch) {
    try {
      await invoke("write_log", { repoPath, message: line });
    } catch (e) {
      console.error("[logger] write_log invoke failed:", e);
    }
  }
}