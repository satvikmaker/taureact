mod commands;
mod menu;
mod tray;
mod updater;

use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
            if args.len() > 1 {
                if let Err(e) = app.emit("deep-link:received", &args[1]) {
                    log::error!("Failed to emit deep-link event: {}", e);
                }
            }
        }))
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_version,
            commands::app::get_app_path,
            commands::app::report_error,
            commands::file::get_file_metadata,
            commands::file::read_file_bytes,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::window::open_window,
            commands::ping,
        ])
        .setup(|app| {
            tray::create_tray(app)?;
            menu::create_menu(app)?;
            updater::setup_updater(app)?;

            // Emit window maximized state changes
            if let Some(main_window) = app.get_webview_window("main") {
                let window_clone = main_window.clone();
                main_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Resized(_) = event {
                        if let Ok(maximized) = window_clone.is_maximized() {
                            if let Err(e) = window_clone.emit("window:maximized-changed", maximized) {
                                log::error!("Failed to emit maximized event: {}", e);
                            }
                        }
                    }
                });

                #[cfg(debug_assertions)]
                main_window.open_devtools();
            }

            Ok(())
        });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
