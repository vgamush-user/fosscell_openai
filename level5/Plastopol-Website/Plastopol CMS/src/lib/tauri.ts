// src/lib/tauri.ts

import { invoke } from "@tauri-apps/api/core";
import { open as dialogOpen } from "@tauri-apps/plugin-dialog";
import type { CmsConfig, CommitEntry } from "./types";

export async function getConfig(): Promise<CmsConfig> {
  return invoke("get_config");
}

export async function saveConfig(config: CmsConfig): Promise<void> {
  return invoke("save_config", { config });
}

export async function gitPull(repoPath: string, selectedBranch : string): Promise<string> {
  return invoke("git_pull", { repoPath: repoPath, branch: selectedBranch });
}

export async function gitCommitPush(
  repoPath: string,
  message: string,
  branch: string,
): Promise<string> {
  return invoke("git_commit_push", { repoPath, message, branch });
}

export async function gitPreviewPush(
  repoPath: string,
  productName: string,
  previewBranch: string,
): Promise<string> {
  return invoke("git_preview_push", { repoPath, productName, previewBranch });
}

export async function gitLog(repoPath: string): Promise<CommitEntry[]> {
  return invoke("git_log", { repoPath });
}

export async function gitRevertLast(repoPath: string, selectedBranch : string): Promise<string> {
  return invoke("git_revert_last", { repoPath: repoPath, branch: selectedBranch });
}

export async function readProducts(repoPath: string): Promise<string> {
  return invoke("read_products", { repoPath });
}

export async function writeProducts(repoPath: string, json: string): Promise<void> {
  return invoke("write_products", { repoPath, json });
}

export async function copyImage(
  repoPath: string,
  sourcePath: string,
  filename: string,
): Promise<void> {
  return invoke("copy_image", { repoPath, sourcePath, filename });
}

// Tauri v2: File.path is not available in the webview.
// Read the file as base64 in JS and send bytes to Rust.
export async function writeImageBytes(
  repoPath: string,
  filename: string,
  file: File,
): Promise<void> {
  const base64Data = await fileToBase64(file);
  return invoke("write_image_bytes", { repoPath, filename, base64Data });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<data>" — strip the prefix
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function deleteImage(repoPath: string, filename: string): Promise<void> {
  return invoke("delete_image", { repoPath, filename });
}

export async function listImages(repoPath: string): Promise<string[]> {
  return invoke("list_images", { repoPath });
}

export async function pickFolder(): Promise<string | null> {
  const result = await dialogOpen({ directory: true, multiple: false });
  return typeof result === "string" ? result : null;
}