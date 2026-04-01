use serde::{Deserialize, Serialize};
use tauri::{Manager, WebviewWindow};
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";
const STORE_KEY: &str = "window-state";

#[derive(Debug, Serialize, Deserialize)]
struct WindowState {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    maximized: bool,
}

/// Restore saved window position/size. Called during setup.
pub fn restore(window: &WebviewWindow) {
    let app = window.app_handle();
    let store = match app.store(STORE_PATH) {
        Ok(s) => s,
        Err(e) => {
            log::debug!("No settings store yet (first launch?): {}", e);
            return;
        }
    };

    let state: WindowState = match store.get(STORE_KEY) {
        Some(val) => match serde_json::from_value(val) {
            Ok(s) => s,
            Err(e) => {
                log::warn!("Failed to deserialize window state: {}", e);
                return;
            }
        },
        None => return, // No saved state — use defaults
    };

    // Validate the saved position is within any connected monitor
    let monitors = match window.available_monitors() {
        Ok(m) => m,
        Err(e) => {
            log::warn!("Failed to get monitors for window state restore: {}", e);
            return;
        }
    };

    let on_screen = monitors.iter().any(|m| {
        let pos = m.position();
        let size = m.size();
        let mx = pos.x;
        let my = pos.y;
        let mw = size.width as i32;
        let mh = size.height as i32;
        // At least 100px of the window must be visible
        state.x + 100 > mx && state.x < mx + mw && state.y + 100 > my && state.y < my + mh
    });

    if on_screen {
        let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: state.x,
            y: state.y,
        }));
        let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: state.width,
            height: state.height,
        }));
    } else {
        log::info!("Saved window position is off-screen — using defaults");
    }

    if state.maximized {
        let _ = window.maximize();
    }
}

/// Save current window position/size. Called on window close.
pub fn save(window: &WebviewWindow) {
    let maximized = window.is_maximized().unwrap_or(false);

    // When maximized, outer_position/outer_size return the maximized geometry,
    // not the restored geometry. On next launch we restore this then re-maximize,
    // which is visually correct — the un-maximize size will be the OS default.
    let pos = match window.outer_position() {
        Ok(p) => p,
        Err(e) => {
            log::warn!("Failed to read window position for save: {}", e);
            return;
        }
    };
    let size = match window.outer_size() {
        Ok(s) => s,
        Err(e) => {
            log::warn!("Failed to read window size for save: {}", e);
            return;
        }
    };

    let state = WindowState {
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        maximized,
    };

    let app = window.app_handle();
    if let Ok(store) = app.store(STORE_PATH) {
        if let Ok(val) = serde_json::to_value(&state) {
            store.set(STORE_KEY, val);
            let _ = store.save();
        }
    }
}
