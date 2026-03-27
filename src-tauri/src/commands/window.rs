use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn open_window(
    app: AppHandle,
    name: String,
    route: String,
) -> Result<(), String> {
    // If window already exists, focus it
    if let Some(window) = app.get_webview_window(&name) {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let url = WebviewUrl::App(route.into());

    WebviewWindowBuilder::new(&app, &name, url)
        .title(&name)
        .inner_size(900.0, 700.0)
        .min_inner_size(400.0, 300.0)
        .center()
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}
