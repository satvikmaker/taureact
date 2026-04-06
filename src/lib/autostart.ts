import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

export const autostart = {
  /** Check if auto-launch is enabled. */
  isEnabled: () => isEnabled(),
  /** Enable auto-launch on system startup. */
  enable: () => enable(),
  /** Disable auto-launch on system startup. */
  disable: () => disable(),
  /** Toggle auto-launch on/off. */
  toggle: async () => {
    if (await isEnabled()) {
      await disable();
      return false;
    } else {
      await enable();
      return true;
    }
  },
} as const;
