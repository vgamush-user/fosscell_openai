use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CmsConfig {
    pub repo_path: String,
    pub default_branch: String,
}

impl Default for CmsConfig {
    fn default() -> Self {
        CmsConfig {
            repo_path: String::new(),
            default_branch: "main".to_string(),
        }
    }
}

fn config_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
        .join("cms_config.json")
}

#[tauri::command]
pub fn get_config(app: tauri::AppHandle) -> Result<CmsConfig, String> {
    let path = config_path(&app);
    if !path.exists() {
        return Ok(CmsConfig::default());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_config(app: tauri::AppHandle, config: CmsConfig) -> Result<(), String> {
    let path = config_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())
}
