// src-tauri/src/main.rs
// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{config, git, images, log, products};

pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::get_config,
            config::save_config,
            git::git_pull,
            git::git_commit_push,
            git::git_preview_push,
            git::git_log,
            git::git_revert_last,
            products::read_products,
            products::write_products,
            images::copy_image,
            images::write_image_bytes,
            images::delete_image,
            images::list_images,
            log::write_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}