import { open, save, type OpenDialogOptions, type SaveDialogOptions } from "@tauri-apps/plugin-dialog";

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenFileOptions {
  title?: string;
  filters?: FileFilter[];
  defaultPath?: string;
  multiple?: boolean;
  directory?: boolean;
}

export interface SaveFileOptions {
  title?: string;
  filters?: FileFilter[];
  defaultPath?: string;
}

/**
 * Open a native file picker dialog.
 * Returns selected file paths (or null if cancelled).
 */
export async function openFile(
  opts: OpenFileOptions = {}
): Promise<string | string[] | null> {
  const options: OpenDialogOptions = {
    title: opts.title,
    defaultPath: opts.defaultPath,
    multiple: opts.multiple ?? false,
    directory: opts.directory ?? false,
    filters: opts.filters,
  };
  return open(options);
}

/**
 * Open a native save dialog.
 * Returns the chosen file path (or null if cancelled).
 */
export async function saveFile(
  opts: SaveFileOptions = {}
): Promise<string | null> {
  const options: SaveDialogOptions = {
    title: opts.title,
    defaultPath: opts.defaultPath,
    filters: opts.filters,
  };
  return save(options);
}
