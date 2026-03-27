/**
 * Typed event listeners for push events from the Tauri backend.
 *
 * Every call to `ipcListen` is statically checked against IpcPushEvents,
 * ensuring the payload type matches the event channel.
 */
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { IpcPushEvents } from "./schema";

export function ipcListen<E extends keyof IpcPushEvents>(
  event: E,
  handler: (payload: IpcPushEvents[E]) => void
): Promise<UnlistenFn> {
  return listen<IpcPushEvents[E]>(event, (e) => handler(e.payload));
}
