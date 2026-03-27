import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ipc } from "@/ipc";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  hydrate: () => Promise<void>;
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

function applyTheme(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    (set) => ({
      mode: "system",
      resolved: resolveTheme("system"),

      setMode: (mode) => {
        const resolved = resolveTheme(mode);
        set({ mode, resolved });
        applyTheme(resolved);
        ipc.settingsSet("theme", mode).catch(console.error);
      },

      hydrate: async () => {
        try {
          const saved = (await ipc.settingsGet("theme")) as ThemeMode | null;
          const mode = saved ?? "system";
          const resolved = resolveTheme(mode);
          set({ mode, resolved });
          applyTheme(resolved);
        } catch {
          // First launch — no saved theme
        }
      },
    }),
    { name: "theme-store" }
  )
);

// Listen for OS theme changes when in system mode.
// This is intentionally module-scoped: the store is a singleton that lives
// for the entire app lifecycle, matching the listener's lifetime.
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { mode } = useThemeStore.getState();
      if (mode === "system") {
        const resolved = resolveTheme("system");
        useThemeStore.setState({ resolved });
        applyTheme(resolved);
      }
    });
}
