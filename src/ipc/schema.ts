/**
 * End-to-end typed IPC schema.
 *
 * IpcSchema defines every Tauri command (renderer → main) with its
 * argument tuple and return type. IpcPushEvents defines every event
 * pushed from the Rust backend to the renderer.
 */

// ── File metadata returned by get_file_metadata ──────────────────────
export interface FileMetadata {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  modified: number | null;
  created: number | null;
}

// ── Error report payload ─────────────────────────────────────────────
export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
}

// ── Update info ──────────────────────────────────────────────────────
export interface UpdateInfo {
  version: string;
  date?: string;
  body?: string;
}

export interface UpdateProgress {
  total: number;
  transferred: number;
}

// ── Context menu ─────────────────────────────────────────────────────
export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  separatorBefore?: boolean;
}

// ── IPC Command Schema (renderer → main) ─────────────────────────────
export interface IpcSchema {
  get_app_version: { args: []; return: string };
  get_app_path: { args: [name: string]; return: string };
  app_ready: { args: []; return: void };
  report_error: { args: [report: ErrorReport]; return: void };
  settings_get: { args: [key: string]; return: unknown };
  settings_set: { args: [key: string, value: unknown]; return: void };
  open_window: { args: [name: string, route: string]; return: void };
  get_file_metadata: { args: [paths: string[]]; return: FileMetadata[] };
  read_file_bytes: { args: [path: string]; return: ArrayBuffer };
  show_context_menu: {
    args: [windowLabel: string, items: ContextMenuItem[]];
    return: void;
  };
  secure_set: { args: [key: string, value: string]; return: void };
  secure_get: { args: [key: string]; return: string | null };
  secure_delete: { args: [key: string]; return: void };
  set_progress: { args: [value: number | null]; return: void };
  ping: { args: []; return: string };
}

// ── Push Events (main → renderer) ────────────────────────────────────
export interface IpcPushEvents {
  "updater:available": UpdateInfo;
  "updater:progress": UpdateProgress;
  "updater:downloaded": { version: string };
  "updater:error": { message: string };
  "window:maximized-changed": boolean;
  "deep-link:received": string;
  "context-menu:selected": string;
}
