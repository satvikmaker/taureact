use tauri::{App, Emitter};
use tauri_plugin_updater::UpdaterExt;

pub fn setup_updater(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle().clone();

    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(5)).await;

        if let Err(e) = check_for_updates(&handle).await {
            log::warn!("Auto-update check failed: {}", e);
        }
    });

    Ok(())
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

            let handle_clone = handle.clone();
            update.download_and_install(
                move |chunk_length, content_length| {
                    if let Some(total) = content_length {
                        let _ = handle_clone.emit("updater:progress", serde_json::json!({
                            "total": total,
                            "transferred": chunk_length,
                        }));
                    }
                },
                || {
                    log::info!("Update downloaded");
                },
            ).await?;

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
            log::warn!("Update check error: {}", e);
        }
    }

    Ok(())
}
