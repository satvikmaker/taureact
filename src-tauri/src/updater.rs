use tauri::{App, Emitter, Manager};
use tauri_plugin_updater::UpdaterExt;

pub fn setup_updater(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    // Skip auto-update check if the updater pubkey is not configured.
    // This prevents errors in development and fresh boilerplate installs.
    // See UPDATER_SETUP.md for configuration instructions.
    let pubkey = app
        .config()
        .plugins
        .0
        .get("updater")
        .and_then(|v| v.get("pubkey"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    if pubkey.is_empty() {
        log::info!("Updater pubkey not configured — skipping auto-update check");
        return Ok(());
    }

    let handle = app.handle().clone();

    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(5)).await;

        if let Err(e) = check_for_updates(&handle).await {
            log::warn!("Auto-update check failed: {}", e);
        }
    });

    Ok(())
}

fn set_taskbar_progress(handle: &tauri::AppHandle, value: Option<f64>) {
    if let Some(window) = handle.get_webview_window("main") {
        let progress = match value {
            Some(v) => tauri::window::ProgressBarState {
                status: Some(tauri::window::ProgressBarStatus::Normal),
                progress: Some((v.clamp(0.0, 1.0) * 100.0) as u64),
            },
            None => tauri::window::ProgressBarState {
                status: Some(tauri::window::ProgressBarStatus::None),
                progress: None,
            },
        };
        let _ = window.set_progress_bar(progress);
    }
}

async fn check_for_updates(handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let updater = handle.updater()?;

    match updater.check().await {
        Ok(Some(update)) => {
            let version = update.version.clone();

            if let Err(e) = handle.emit("updater:available", serde_json::json!({
                "version": &version,
                "date": update.date.map(|d| d.to_string()),
                "body": &update.body
            })) {
                log::error!("Failed to emit updater:available: {}", e);
            }

            let mut total_transferred: u64 = 0;
            let handle_clone = handle.clone();
            update.download_and_install(
                move |chunk_length, content_length| {
                    if let Some(total) = content_length {
                        total_transferred += chunk_length as u64;
                        let fraction = total_transferred as f64 / total as f64;

                        // Update taskbar/dock progress
                        set_taskbar_progress(&handle_clone, Some(fraction));

                        let _ = handle_clone.emit("updater:progress", serde_json::json!({
                            "total": total,
                            "transferred": total_transferred,
                        }));
                    }
                },
                || {
                    log::info!("Update downloaded");
                },
            ).await?;

            // Clear taskbar progress
            set_taskbar_progress(handle, None);

            if let Err(e) = handle.emit("updater:downloaded", serde_json::json!({
                "version": &version
            })) {
                log::error!("Failed to emit updater:downloaded: {}", e);
            }
        }
        Ok(None) => {
            log::info!("No updates available");
        }
        Err(e) => {
            // Clear progress on error too
            set_taskbar_progress(handle, None);
            log::warn!("Update check error: {}", e);
            let _ = handle.emit("updater:error", serde_json::json!({
                "message": e.to_string()
            }));
        }
    }

    Ok(())
}
