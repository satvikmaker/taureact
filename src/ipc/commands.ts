/**
 * Typed Tauri command invocations.
 *
 * Every call to `ipcInvoke` is statically checked against IpcSchema,
 * ensuring the arguments and return type match the Rust handler.
 */
import { invoke } from "@tauri-apps/api/core";
import type { IpcSchema } from "./schema";

// ── Typed invoke helper ──────────────────────────────────────────────
// Maps IpcSchema arg tuples to the `invoke()` args object format that
// Tauri expects.

type CommandArgs<C extends keyof IpcSchema> = IpcSchema[C]["args"];
type CommandReturn<C extends keyof IpcSchema> = IpcSchema[C]["return"];

// Build the invoke args object from the schema's positional arg tuple.
// Tauri invoke sends named args, so each command has a specific mapping.
const ARG_NAMES: Record<keyof IpcSchema, string[]> = {
  get_app_version: [],
  get_app_path: ["name"],
  report_error: ["report"],
  settings_get: ["key"],
  settings_set: ["key", "value"],
  open_window: ["name", "route"],
  get_file_metadata: ["paths"],
  read_file_bytes: ["path"],
  ping: [],
};

function buildArgs<C extends keyof IpcSchema>(
  cmd: C,
  args: CommandArgs<C>
): Record<string, unknown> {
  const names = ARG_NAMES[cmd];
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < names.length; i++) {
    obj[names[i]] = (args as unknown[])[i];
  }
  return obj;
}

export async function ipcInvoke<C extends keyof IpcSchema>(
  command: C,
  ...args: CommandArgs<C>
): Promise<CommandReturn<C>> {
  return invoke<CommandReturn<C>>(command, buildArgs(command, args));
}

// ── Convenience wrappers ─────────────────────────────────────────────

export const ipc = {
  getAppVersion: () => ipcInvoke("get_app_version"),
  getAppPath: (name: string) => ipcInvoke("get_app_path", name),
  reportError: (report: { message: string; stack?: string; componentStack?: string }) =>
    ipcInvoke("report_error", report),
  settingsGet: (key: string) => ipcInvoke("settings_get", key),
  settingsSet: (key: string, value: unknown) => ipcInvoke("settings_set", key, value),
  openWindow: (name: string, route: string) => ipcInvoke("open_window", name, route),
  getFileMetadata: (paths: string[]) => ipcInvoke("get_file_metadata", paths),
  readFileBytes: (path: string) => ipcInvoke("read_file_bytes", path),
  ping: () => ipcInvoke("ping"),
} as const;
