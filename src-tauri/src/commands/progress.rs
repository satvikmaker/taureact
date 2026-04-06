use tauri::{AppHandle, Manager};

/// Set the taskbar/dock progress indicator.
/// `value` is 0.0–1.0 for progress, or null to clear.
#[tauri::command]
pub fn set_progress(app: AppHandle, value: Option<f64>) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;

    match value {
        Some(v) => {
            let clamped = v.clamp(0.0, 1.0);
            let progress = tauri::window::ProgressBarState {
                status: Some(tauri::window::ProgressBarStatus::Normal),
                progress: Some((clamped * 100.0) as u64),
            };
            window
                .set_progress_bar(progress)
                .map_err(|e| e.to_string())
        }
        None => {
            let progress = tauri::window::ProgressBarState {
                status: Some(tauri::window::ProgressBarStatus::None),
                progress: None,
            };
            window
                .set_progress_bar(progress)
                .map_err(|e| e.to_string())
        }
    }
}
