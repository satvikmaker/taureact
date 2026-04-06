import { useEffect } from "react";
import { registerShortcut } from "@/lib/shortcuts";

/**
 * Register an in-app keyboard shortcut for the lifetime of the component.
 *
 * The global keydown listener is managed centrally by shortcuts.ts —
 * this hook only registers/unregisters the entry in the registry.
 *
 * @example
 * useShortcut("CmdOrCtrl+K", "Open command palette", () => {
 *   setCommandPaletteOpen(true);
 * });
 */
export function useShortcut(
  combo: string,
  description: string,
  callback: () => void
): void {
  useEffect(() => {
    return registerShortcut({ combo, description, callback });
  }, [combo, description, callback]);
}
