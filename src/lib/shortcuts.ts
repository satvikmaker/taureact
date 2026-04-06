/**
 * Centralized in-app shortcut registry with conflict detection.
 *
 * A single global keydown listener is attached once and dispatches
 * to the registry. Individual useShortcut() hooks only register/unregister
 * entries — they do NOT add their own listeners.
 */

export interface ShortcutEntry {
  /** e.g. "CmdOrCtrl+K" */
  combo: string;
  description: string;
  callback: () => void;
}

/** Normalize platform-agnostic combo to a canonical key for comparison. */
function normalizeCombo(combo: string): string {
  return combo
    .toLowerCase()
    .split("+")
    .map((k) => k.trim())
    .sort()
    .join("+");
}

const registry = new Map<string, ShortcutEntry>();

/** Attach the single global keydown listener once. */
let listenerAttached = false;
function ensureGlobalListener() {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    handleKeyEvent(e);
  });
}

export function registerShortcut(entry: ShortcutEntry): () => void {
  ensureGlobalListener();
  const key = normalizeCombo(entry.combo);
  if (registry.has(key)) {
    console.warn(
      `Shortcut conflict: "${entry.combo}" is already registered as "${registry.get(key)!.description}"`
    );
  }
  registry.set(key, entry);
  return () => {
    registry.delete(key);
  };
}

export function getRegisteredShortcuts(): ShortcutEntry[] {
  return Array.from(registry.values());
}

/**
 * Parse a KeyboardEvent into a normalized combo string.
 * Matches against the registry and fires the callback if found.
 */
function handleKeyEvent(e: KeyboardEvent): boolean {
  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push("cmdorctrl");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");

  const key = e.key.toLowerCase();
  if (!["control", "shift", "alt", "meta"].includes(key)) {
    parts.push(key);
  }

  const combo = parts.sort().join("+");
  const entry = registry.get(combo);

  if (entry) {
    e.preventDefault();
    entry.callback();
    return true;
  }
  return false;
}
