import { ipc } from "@/ipc";
import { log } from "./logger";

export interface CrashReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  appVersion?: string;
  platform?: string;
}

/**
 * Report a crash to the Rust backend log and optionally to an external endpoint.
 *
 * The endpoint URL is opt-in. Set it via `configureCrashReporter({ endpoint })`.
 * When no endpoint is configured, crashes are only logged locally via tauri-plugin-log.
 */
const config: { endpoint?: string; enabled: boolean } = { enabled: true };

export function configureCrashReporter(opts: {
  endpoint?: string;
  enabled?: boolean;
}) {
  if (opts.endpoint !== undefined) config.endpoint = opts.endpoint;
  if (opts.enabled !== undefined) config.enabled = opts.enabled;
}

export async function reportCrash(report: CrashReport): Promise<void> {
  if (!config.enabled) return;

  // Always log locally via IPC
  ipc
    .reportError({
      message: report.message,
      stack: report.stack,
      componentStack: report.componentStack,
    })
    .catch(() => {}); // Best-effort

  log.error(
    `CRASH: ${report.message}\nStack: ${report.stack ?? "N/A"}\nComponent: ${report.componentStack ?? "N/A"}`
  );

  // Optionally POST to external endpoint (e.g. Sentry, BugSnag, custom)
  if (config.endpoint) {
    try {
      await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch (e) {
      // Don't throw during crash reporting
      log.warn(`Failed to send crash report to external endpoint: ${e}`);
    }
  }
}
