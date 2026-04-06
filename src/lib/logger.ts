import {
  trace,
  debug,
  info,
  warn,
  error,
  attachConsole,
} from "@tauri-apps/plugin-log";

export const log = {
  /** Verbose trace-level logging (dev only). */
  trace: (msg: string) => trace(msg),
  /** Debug-level logging. */
  debug: (msg: string) => debug(msg),
  /** Info-level logging. */
  info: (msg: string) => info(msg),
  /** Warning-level logging. */
  warn: (msg: string) => warn(msg),
  /** Error-level logging. */
  error: (msg: string) => error(msg),
} as const;

let consoleDetach: (() => void) | null = null;

/**
 * Initialize the logging bridge: forward all console.log/warn/error
 * calls to the Tauri log plugin so they appear in the log file.
 * Call once at app startup.
 */
export async function initLogging(): Promise<void> {
  try {
    consoleDetach = await attachConsole();
  } catch {
    // Plugin not available (e.g., in tests)
  }
}

/**
 * Detach the console bridge. Call on app teardown if needed.
 */
export function teardownLogging(): void {
  consoleDetach?.();
  consoleDetach = null;
}
