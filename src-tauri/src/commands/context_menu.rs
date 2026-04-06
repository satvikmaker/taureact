use serde::Deserialize;
use std::sync::{Arc, Mutex, OnceLock};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    AppHandle, Emitter, Manager,
};

/// Prefix applied to all context menu item IDs to avoid collision
/// with app menu IDs ("reload", "devtools", etc.).
const CTX_PREFIX: &str = "ctx:";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextMenuItem {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub disabled: bool,
    #[serde(default)]
    pub separator_before: bool,
}

/// Shared state: the set of item IDs for the currently-open context menu.
/// Only one context menu can be open at a time (popup_menu blocks),
/// so a single shared slot is sufficient.
static ACTIVE_IDS: OnceLock<Arc<Mutex<Vec<String>>>> = OnceLock::new();

fn get_active_ids() -> &'static Arc<Mutex<Vec<String>>> {
    ACTIVE_IDS.get_or_init(|| Arc::new(Mutex::new(Vec::new())))
}

/// Show a native OS context menu at the cursor position.
/// Emits `context-menu:selected` event with the selected item ID (without prefix).
#[tauri::command]
pub fn show_context_menu(
    app: AppHandle,
    window_label: String,
    items: Vec<ContextMenuItem>,
) -> Result<(), String> {
    let window = app
        .get_webview_window(&window_label)
        .ok_or_else(|| format!("Window '{}' not found", window_label))?;

    let mut builder = MenuBuilder::new(&app);

    // Namespace IDs to avoid collision with app menu items
    let prefixed_ids: Vec<(String, String)> = items
        .iter()
        .map(|item| (format!("{}{}", CTX_PREFIX, item.id), item.id.clone()))
        .collect();

    for (i, item) in items.iter().enumerate() {
        if item.separator_before {
            builder = builder.separator();
        }
        let menu_item = MenuItemBuilder::with_id(&prefixed_ids[i].0, &item.label)
            .enabled(!item.disabled)
            .build(&app)
            .map_err(|e| e.to_string())?;
        builder = builder.item(&menu_item);
    }

    let menu = builder.build().map_err(|e| e.to_string())?;

    // Swap in the new prefixed IDs
    {
        let mut ids = get_active_ids().lock().unwrap();
        *ids = prefixed_ids.iter().map(|(p, _)| p.clone()).collect();
    }

    // Show the popup. This blocks until the user selects or dismisses.
    window.popup_menu(&menu).map_err(|e| e.to_string())?;

    // Clear IDs after the popup closes
    {
        let mut ids = get_active_ids().lock().unwrap();
        ids.clear();
    }

    Ok(())
}

/// Register the single global context-menu event handler.
/// Call once during app setup.
pub fn init_context_menu_handler(app: &tauri::App) {
    let handle = app.handle().clone();
    app.on_menu_event(move |_app, event| {
        let event_id = event.id().as_ref().to_string();
        // Only handle events with our namespace prefix
        if let Some(original_id) = event_id.strip_prefix(CTX_PREFIX) {
            let ids = get_active_ids().lock().unwrap();
            if ids.contains(&event_id) {
                // Emit the original (unprefixed) ID to the frontend
                if let Err(e) = handle.emit("context-menu:selected", original_id) {
                    log::error!("Failed to emit context-menu:selected: {}", e);
                }
            }
        }
    });
}
