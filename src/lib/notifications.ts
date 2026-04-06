import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
  type Options,
} from "@tauri-apps/plugin-notification";

/**
 * Send a native OS notification. Handles permission check automatically.
 */
export async function notify(
  title: string,
  body?: string,
  opts?: Partial<Options>
): Promise<void> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const permission = await requestPermission();
    granted = permission === "granted";
  }
  if (!granted) return;

  sendNotification({ title, body, ...opts });
}
