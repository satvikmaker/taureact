import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { ipc } from "@/ipc";

interface SettingsState {
  cache: Record<string, unknown>;
  get: <T = unknown>(key: string) => T | undefined;
  set: (key: string, value: unknown) => Promise<void>;
  load: (key: string) => Promise<unknown>;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      cache: {},

      get: <T = unknown>(key: string): T | undefined =>
        get().cache[key] as T | undefined,

      set: async (key, value) => {
        set((state) => ({
          cache: { ...state.cache, [key]: value },
        }));
        await ipc.settingsSet(key, value);
      },

      load: async (key) => {
        const value = await ipc.settingsGet(key);
        set((state) => ({
          cache: { ...state.cache, [key]: value },
        }));
        return value;
      },
    }),
    { name: "settings-store" }
  )
);
