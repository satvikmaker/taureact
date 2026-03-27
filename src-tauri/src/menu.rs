use tauri::{
    menu::{AboutMetadataBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    App, Manager,
};

pub fn create_menu(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    let app_menu = {
        let about_metadata = AboutMetadataBuilder::new()
            .name(Some("TauReact"))
            .version(Some(env!("CARGO_PKG_VERSION")))
            .build();

        SubmenuBuilder::new(app, "TauReact")
            .about(Some(about_metadata))
            .separator()
            .services()
            .separator()
            .hide()
            .hide_others()
            .show_all()
            .separator()
            .quit()
            .build()?
    };

    let file_menu = SubmenuBuilder::new(app, "File")
        .close_window()
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let reload = MenuItemBuilder::with_id("reload", "Reload")
        .accelerator("CmdOrCtrl+R")
        .build(app)?;
    let devtools = MenuItemBuilder::with_id("devtools", "Toggle Developer Tools")
        .accelerator("CmdOrCtrl+Shift+I")
        .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&reload)
        .item(&devtools)
        .separator()
        .fullscreen()
        .build()?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .build()?;

    let help_menu = {
        #[cfg(not(target_os = "macos"))]
        let about = MenuItemBuilder::with_id("about", "About TauReact").build(app)?;

        let builder = SubmenuBuilder::new(app, "Help");

        #[cfg(not(target_os = "macos"))]
        let builder = builder.item(&about);

        builder.build()?
    };

    let mut menu_builder = MenuBuilder::new(app);

    #[cfg(target_os = "macos")]
    {
        menu_builder = menu_builder.item(&app_menu);
    }

    let menu = menu_builder
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&window_menu)
        .item(&help_menu)
        .build()?;

    app.set_menu(menu)?;

    app.on_menu_event(move |app, event| match event.id().as_ref() {
        "reload" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.eval("location.reload()");
            }
        }
        "devtools" => {
            if let Some(window) = app.get_webview_window("main") {
                if window.is_devtools_open() {
                    window.close_devtools();
                } else {
                    window.open_devtools();
                }
            }
        }
        _ => {}
    });

    Ok(())
}
