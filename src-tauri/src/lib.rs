mod commands;
mod menu;
mod tray;
mod updater;
mod window_state;

use tauri::{Emitter, Manager, WebviewWindowBuilder};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

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
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:app.db", vec![])
                .build(),
        )
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
            commands::context_menu::show_context_menu,
            commands::keyring::secure_set,
            commands::keyring::secure_get,
            commands::keyring::secure_delete,
            commands::progress::set_progress,
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

            // ── Global shortcut: CmdOrCtrl+Shift+Space → show/hide ──
            let show_hide = Shortcut::new(
                Some(Modifiers::SUPER | Modifiers::SHIFT),
                Code::Space,
            );
            let handle = app.handle().clone();
            app.global_shortcut().on_shortcut(show_hide, move |_app, _shortcut, _event| {
                if let Some(window) = handle.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }).unwrap_or_else(|e| log::warn!("Failed to register global shortcut: {}", e));

            // ── Splash fallback timeout ──────────────────────────────
            let fallback_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(15)).await;
                if let Some(main) = fallback_handle.get_webview_window("main") {
                    if !main.is_visible().unwrap_or(true) {
                        log::warn!("app_ready() not called after 15s — showing main window");
                        let _ = main.show();
                        let _ = main.set_focus();
                        if let Some(splash) = fallback_handle.get_webview_window("splash") {
                            let _ = splash.close();
                        }
                    }
                }
            });

            commands::context_menu::init_context_menu_handler(app);
            tray::create_tray(app)?;
            menu::create_menu(app)?;
            updater::setup_updater(app)?;

            Ok(())
        });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
