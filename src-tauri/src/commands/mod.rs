pub mod app;
pub mod file;
pub mod settings;
pub mod window;

#[tauri::command]
pub fn ping() -> String {
    "pong".to_string()
}
