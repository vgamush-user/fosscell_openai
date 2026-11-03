use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use chrono::Local;
use tauri::Manager;
use tauri::AppHandle;

fn log_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .expect("failed to get app data dir")
        .join("cms-logs.txt")
}

#[tauri::command]
pub fn write_log(app: AppHandle, message: String) -> Result<(), String> {
    let path = log_path(&app);
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let line = format!("[{}] {}\n", timestamp, message);

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| format!("Cannot open log file: {}", e))?;

    file.write_all(line.as_bytes())
        .map_err(|e| format!("Cannot write log: {}", e))
}