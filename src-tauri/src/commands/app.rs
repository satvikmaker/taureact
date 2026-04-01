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

/// Called by the frontend once React has mounted.
/// Closes the splash screen and shows the main window.
#[tauri::command]
pub fn app_ready(app: AppHandle) {
    if let Some(splash) = app.get_webview_window("splash") {
        if let Err(e) = splash.close() {
            log::error!("Failed to close splash window: {}", e);
        }
    }
    if let Some(main_win) = app.get_webview_window("main") {
        if let Err(e) = main_win.show() {
            log::error!("Failed to show main window: {}", e);
        }
        if let Err(e) = main_win.set_focus() {
            log::warn!("Failed to focus main window: {}", e);
        }

        // DEBUG_PROD: open devtools in production builds when env var is set
        if std::env::var("DEBUG_PROD").unwrap_or_default() == "true" {
            main_win.open_devtools();
        }
    }
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
