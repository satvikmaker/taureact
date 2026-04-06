import { ipc } from "@/ipc";

/**
 * Typed wrapper for OS keychain credential storage.
 * Uses the keyring crate on Rust side (macOS Keychain, Windows DPAPI, Linux libsecret).
 *
 * All values are encrypted at rest by the OS keychain provider.
 */
export const secureStore = {
  /** Store a secret in the OS keychain. */
  set: (key: string, value: string) => ipc.secureSet(key, value),

  /** Retrieve a secret from the OS keychain. Returns null if not found. */
  get: (key: string) => ipc.secureGet(key),

  /** Delete a secret from the OS keychain. */
  delete: (key: string) => ipc.secureDelete(key),
} as const;
