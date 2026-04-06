# 8 Features Implementation Plan

## Architecture Decision: IPC vs Native Plugin

| Feature | Approach | Custom IPC? |
|---------|----------|-------------|
| Notifications | `tauri-plugin-notification` JS API | No — plugin handles it |
| Global shortcuts | `tauri-plugin-global-shortcut` + Rust setup | No — plugin JS API + Rust registration |
| In-app shortcuts | React hook (DOM keydown) | No — pure frontend |
| Native context menu | Custom Rust command → `popup_menu()` | **Yes** — window-level API |
| React context menu | React component | No — pure frontend |
| Secure credentials | Custom Rust commands + `keyring` crate | **Yes** — OS keychain access |
| Zustand persistence | Zustand middleware + store plugin JS API | No — uses existing store plugin |
| File dialogs | `@tauri-apps/plugin-dialog` JS API | No — plugin handles it |
| i18n | `i18next` + `react-i18next` | No — pure frontend |
| Progress bar | Custom Rust command → `set_progress_bar()` | **Yes** — window-level API |

**3 features need custom IPC commands. 7 features use plugins or pure frontend.**

---

## 1. Native OS Notifications

**Rust**: Add `tauri-plugin-notification = "2"` to Cargo.toml. Init in lib.rs.
**JS**: `npm install @tauri-apps/plugin-notification`. Create `src/lib/notifications.ts` typed wrapper.
**Permissions**: Add `notification:default` to capabilities.
**Demo**: "Notify" button in App.tsx.

## 2. Keyboard Shortcuts

### Global (Tauri-level)
**Rust**: Add `tauri-plugin-global-shortcut = "2"`. Register `CmdOrCtrl+Shift+Space` (show/hide) in lib.rs setup.
**JS**: `npm install @tauri-apps/plugin-global-shortcut`.
**Permissions**: Add `global-shortcut:default`.

### In-App (React)
**Frontend**: Create `src/hooks/useShortcut.ts` — attaches keydown listener, parses mod+key combos.
**Registry**: Create `src/lib/shortcuts.ts` — central registry with conflict detection, shortcut descriptions.

## 3. Right-Click Context Menus

### Native
**Rust**: Create `commands/context_menu.rs` — accepts serialized menu items from frontend, builds `Menu`, calls `popup_menu()` on the window. Returns selected item ID.
**IPC Schema**: Add `show_context_menu` command.

### React Component
**Frontend**: Create `src/components/ContextMenu.tsx` — positioned absolutely at cursor, Tailwind-styled, keyboard navigable, click-outside-to-close.

## 4. Secure Credential Storage

**Rust**: Add `keyring = "3"` crate to Cargo.toml. Create `commands/keyring.rs` with:
- `secure_set(service, key, value)` — stores in OS keychain
- `secure_get(service, key)` → `Option<String>`
- `secure_delete(service, key)`

**Frontend**: Create `src/lib/secure-store.ts` typed wrapper with service name bound to app identifier.
**IPC Schema**: Add 3 commands.

## 5. Zustand State Persistence (Crash Recovery)

**Frontend**: Create `src/store/persist.ts` — a Zustand middleware that:
1. On state change: debounce (500ms), serialize selected slices, write to `tauri-plugin-store` via JS API
2. On startup: read from store, merge into initial state
3. Only persist non-sensitive, reconstructable state

Apply to: `themeStore` (mode), `appStore` (nothing sensitive), `settingsStore` (cache).

## 6. Native File Dialogs

**Frontend**: Create `src/lib/dialogs.ts` — typed wrappers around `@tauri-apps/plugin-dialog`:
- `openFile(options)` → selected paths
- `saveFile(options)` → selected path
- Typed filter options
**Demo**: "Open File" button in App.tsx next to DropZone.

## 7. Internationalization (i18n)

**Frontend**: Install `i18next` + `react-i18next`.
- Create `src/i18n/index.ts` — config with fallback, lazy loading
- Create `src/i18n/locales/en.json`, `es.json`, `ja.json`
- Create `src/components/LanguageSwitcher.tsx`
- Persist language preference to settings store
- Detect OS locale via `@tauri-apps/plugin-os`

## 8. Taskbar/Dock Progress

**Rust**: Create `commands/progress.rs`:
- `set_progress(value: Option<f64>)` — calls `window.set_progress_bar()`. None = clear.
**Wire**: Update `updater.rs` to call `set_progress_bar()` during download.
**Frontend**: Create `src/lib/progress.ts` wrapper. IPC schema addition.

---

## File Changes Summary

### New Rust files
- `src-tauri/src/commands/context_menu.rs`
- `src-tauri/src/commands/keyring.rs`
- `src-tauri/src/commands/progress.rs`

### Modified Rust files
- `Cargo.toml` — add 3 plugins + keyring crate
- `lib.rs` — init 3 plugins, register 5 new commands, setup global shortcuts
- `commands/mod.rs` — add 3 new modules
- `updater.rs` — wire progress bar during download
- `capabilities/default.json` — add 3 plugin permissions

### New frontend files
- `src/lib/notifications.ts`
- `src/lib/shortcuts.ts`
- `src/lib/secure-store.ts`
- `src/lib/dialogs.ts`
- `src/lib/progress.ts`
- `src/hooks/useShortcut.ts`
- `src/components/ContextMenu.tsx`
- `src/components/LanguageSwitcher.tsx`
- `src/store/persist.ts`
- `src/i18n/index.ts`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/i18n/locales/ja.json`

### Modified frontend files
- `ipc/schema.ts` — add 5 new commands + 1 event
- `ipc/commands.ts` — add ARG_NAMES + wrappers
- `components/index.ts` — export new components
- `hooks/index.ts` — export useShortcut
- `store/index.ts` — exports
- `App.tsx` — demo sections for notifications, file dialog, shortcuts
- `main.tsx` — init i18n
- `package.json` — add 5 npm packages

### New test files
- `tests/hooks/useShortcut.test.ts`
- `tests/components/ContextMenu.test.tsx`
- `tests/lib/notifications.test.ts`
- `tests/store/persist.test.ts`
