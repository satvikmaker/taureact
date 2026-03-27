import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  version: string;
  isMaximized: boolean;
  isOnline: boolean;
  platform: string;
  setVersion: (version: string) => void;
  setMaximized: (maximized: boolean) => void;
  setOnline: (online: boolean) => void;
  setPlatform: (platform: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      version: "0.0.0",
      isMaximized: false,
      isOnline: navigator.onLine,
      platform: "unknown",

      setVersion: (version) => set({ version }),
      setMaximized: (maximized) => set({ isMaximized: maximized }),
      setOnline: (online) => set({ isOnline: online }),
      setPlatform: (platform) => set({ platform }),
    }),
    { name: "app-store" }
  )
);
