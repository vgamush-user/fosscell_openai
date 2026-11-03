// src-tauri/src/commands/git.rs

use serde::{Deserialize, Serialize};
use std::process::Command;

fn run_git(repo: &str, args: &[&str]) -> Result<String, String> {
    let out = Command::new("git")
        .args(args)
        .current_dir(repo)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if out.status.success() {
        Ok(String::from_utf8_lossy(&out.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).trim().to_string())
    }
}

/// Check if a branch exists locally
fn branch_exists(repo: &str, branch: &str) -> bool {
    run_git(repo, &["rev-parse", "--verify", branch]).is_ok()
}

/// Ensure branch exists and is checked out
fn ensure_branch(repo: &str, branch: &str) -> Result<(), String> {
    if branch_exists(repo, branch) {
        // Switch to existing branch
        run_git(repo, &["checkout", branch])?;
    } else {
        // Create and switch to new branch
        run_git(repo, &["checkout", "-b", branch])?;
    }
    Ok(())
}

#[tauri::command]
pub fn git_pull(repo_path: String, branch: String) -> Result<String, String> {
    ensure_branch(&repo_path, &branch)?;
    run_git(&repo_path, &["pull", "origin", &branch])
}

#[tauri::command]
pub fn git_commit_push(
    repo_path: String,
    message: String,
    branch: String,
) -> Result<String, String> {
    // Ensure correct branch
    ensure_branch(&repo_path, &branch)?;

    // Stage changes
    run_git(&repo_path, &["add", "."])?;

    // Commit (ignore empty commit error)
    let _ = run_git(&repo_path, &["commit", "-m", &message]);

    // Push branch (set upstream if needed)
    run_git(&repo_path, &["push", "-u", "origin", &branch])
}

/// Push to preview branch (force push, does NOT switch branch)
#[tauri::command]
pub fn git_preview_push(
    repo_path: String,
    product_name: String,
    preview_branch: String,
) -> Result<String, String> {
    let message = format!("preview: {}", product_name);

    run_git(&repo_path, &["add", "."])?;

    // Commit may fail if nothing changed — ignore
    let _ = run_git(&repo_path, &["commit", "-m", &message]);

    // Force push current HEAD → preview branch
    run_git(
        &repo_path,
        &[
            "push",
            "origin",
            &format!("HEAD:{}", preview_branch),
            "--force",
        ],
    )
}

#[derive(Serialize, Deserialize)]
pub struct CommitEntry {
    pub hash: String,
    pub message: String,
    pub date: String,
}

#[tauri::command]
pub fn git_log(repo_path: String) -> Result<Vec<CommitEntry>, String> {
    let raw = run_git(
        &repo_path,
        &["log", "--format=%H|%s|%cd", "--date=short", "-20"],
    )?;

    let entries = raw
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.splitn(3, '|').collect();
            if parts.len() == 3 {
                Some(CommitEntry {
                    hash: parts[0].to_string(),
                    message: parts[1].to_string(),
                    date: parts[2].to_string(),
                })
            } else {
                None
            }
        })
        .collect();

    Ok(entries)
}

#[tauri::command]
pub fn git_revert_last(repo_path: String, branch: String) -> Result<String, String> {
    ensure_branch(&repo_path, &branch)?;
    run_git(&repo_path, &["revert", "--no-edit", "HEAD"])
}