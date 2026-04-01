mod commands;
mod menu;
mod tray;
mod updater;
mod window_state;

use tauri::{Emitter, Manager, WebviewWindowBuilder};

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
            commands::app::app_ready,
            commands::file::get_file_metadata,
            commands::file::read_file_bytes,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::window::open_window,
            commands::ping,
        ])
        .setup(|app| {
            // ── Splash screen ───────────────────────────────────────
            let _splash = WebviewWindowBuilder::new(
                app,
                "splash",
                tauri::WebviewUrl::App("splash.html".into()),
            )
            .title("")
            .inner_size(300.0, 300.0)
            .resizable(false)
            .decorations(false)
            .center()
            .always_on_top(true)
            .skip_taskbar(true)
            .build()?;

            // Hide main window until the frontend calls app_ready
            if let Some(main_window) = app.get_webview_window("main") {
                let _ = main_window.hide();

                // ── Restore window state ────────────────────────────
                window_state::restore(&main_window);

                // ── Window events (save state + maximized tracking) ─
                let main_for_events = main_window.clone();
                main_window.on_window_event(move |event| {
                    match event {
                        tauri::WindowEvent::CloseRequested { .. } => {
                            window_state::save(&main_for_events);
                        }
                        tauri::WindowEvent::Resized(_) => {
                            if let Ok(maximized) = main_for_events.is_maximized() {
                                if let Err(e) =
                                    main_for_events.emit("window:maximized-changed", maximized)
                                {
                                    log::error!("Failed to emit maximized event: {}", e);
                                }
                            }
                        }
                        _ => {}
                    }
                });

                #[cfg(debug_assertions)]
                main_window.open_devtools();
            }

            // ── Splash fallback timeout ──────────────────────────
            // If the frontend fails to call app_ready within 15s,
            // show the main window anyway to avoid a blank screen.
            let fallback_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(15)).await;
                if let Some(main) = fallback_handle.get_webview_window("main") {
                    if !main.is_visible().unwrap_or(true) {
                        log::warn!("app_ready() not called after 15s — showing main window as fallback");
                        let _ = main.show();
                        let _ = main.set_focus();
                        if let Some(splash) = fallback_handle.get_webview_window("splash") {
                            let _ = splash.close();
                        }
                    }
                }
            });

            tray::create_tray(app)?;
            menu::create_menu(app)?;
            updater::setup_updater(app)?;

            Ok(())
        });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
