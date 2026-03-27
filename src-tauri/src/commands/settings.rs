use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";

#[tauri::command]
pub fn settings_get(app: AppHandle, key: String) -> Result<Option<serde_json::Value>, String> {
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    Ok(store.get(&key))
}

#[tauri::command]
pub fn settings_set(app: AppHandle, key: String, value: serde_json::Value) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    store.set(&key, value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
