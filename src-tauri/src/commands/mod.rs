pub mod app;
pub mod context_menu;
pub mod file;
pub mod keyring;
pub mod progress;
pub mod settings;
pub mod window;

#[tauri::command]
pub fn ping() -> String {
    "pong".to_string()
}
