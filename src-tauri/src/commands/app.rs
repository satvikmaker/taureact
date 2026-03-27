use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn get_app_version(app: AppHandle) -> String {
    app.config().version.clone().unwrap_or_else(|| "0.0.0".to_string())
}

#[tauri::command]
pub fn get_app_path(app: AppHandle, name: String) -> Result<String, String> {
    let path_resolver = app.path();
    let path = match name.as_str() {
        "home" => path_resolver.home_dir(),
        "appData" | "app_data" => path_resolver.app_data_dir(),
        "appConfig" | "app_config" => path_resolver.app_config_dir(),
        "appLog" | "app_log" => path_resolver.app_log_dir(),
        "appLocalData" | "app_local_data" => path_resolver.app_local_data_dir(),
        "appCache" | "app_cache" => path_resolver.app_cache_dir(),
        "desktop" => path_resolver.desktop_dir(),
        "document" => path_resolver.document_dir(),
        "download" => path_resolver.download_dir(),
        "temp" => path_resolver.temp_dir(),
        _ => return Err(format!("Unknown path name: {}", name)),
    };

    path.map(|p: std::path::PathBuf| p.to_string_lossy().to_string())
        .map_err(|e: tauri::Error| e.to_string())
}

#[derive(serde::Deserialize)]
pub struct ErrorReport {
    pub message: String,
    pub stack: Option<String>,
    pub component_stack: Option<String>,
}

#[tauri::command]
pub fn report_error(report: ErrorReport) {
    log::error!(
        "Renderer error: {}\nStack: {}\nComponent: {}",
        report.message,
        report.stack.as_deref().unwrap_or("N/A"),
        report.component_stack.as_deref().unwrap_or("N/A")
    );
}
