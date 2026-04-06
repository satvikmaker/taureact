import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { tauriPersist, rehydrateStore } from "./persist";

export type Platform = "macos" | "windows" | "linux" | "unknown";

interface AppState {
  // ── Core ────────────────────────────────────────────────────────
  version: string;
  isMaximized: boolean;
  lastRoute: string;

  // ── Environment (synced from hooks for non-React access) ───────
  isOnline: boolean;
  platform: Platform;

  // ── Actions ────────────────────────────────────────────────────
  setVersion: (version: string) => void;
  setMaximized: (maximized: boolean) => void;
  setLastRoute: (route: string) => void;
  setOnline: (online: boolean) => void;
  setPlatform: (platform: Platform) => void;

  /** Rehydrate persisted slices from disk (call once at startup). */
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    tauriPersist(
      (set) => ({
        version: "0.0.0",
        isMaximized: false,
        lastRoute: "/",
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        platform: "unknown",

        setVersion: (version) => set({ version }),
        setMaximized: (maximized) => set({ isMaximized: maximized }),
        setLastRoute: (route) => set({ lastRoute: route }),
        setOnline: (online) => set({ isOnline: online }),
        setPlatform: (platform) => set({ platform }),
        hydrate: async () => {
          await rehydrateStore<AppState>("app-state", set);
        },
      }),
      { name: "app-state", pick: ["lastRoute"] }
    ),
    { name: "app-store" }
  )
);

// ── Sync online status into the store (module-scoped, singleton) ─────
// This keeps useAppStore.getState().isOnline current for non-React code
// (e.g., crash-reporter, logger). Components should still use useOnline().
if (typeof window !== "undefined") {
  const syncOnline = () => useAppStore.getState().setOnline(navigator.onLine);
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);
}
