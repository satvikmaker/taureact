import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UpdateInfo, UpdateProgress } from "@/ipc";

type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "ready" | "error";

interface UpdaterState {
  status: UpdateStatus;
  info: UpdateInfo | null;
  progress: UpdateProgress | null;
  error: string | null;
  setAvailable: (info: UpdateInfo) => void;
  setProgress: (progress: UpdateProgress) => void;
  setDownloaded: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useUpdaterStore = create<UpdaterState>()(
  devtools(
    (set) => ({
      status: "idle",
      info: null,
      progress: null,
      error: null,

      setAvailable: (info) =>
        set({ status: "available", info, error: null }),

      setProgress: (progress) =>
        set({ status: "downloading", progress }),

      setDownloaded: () =>
        set({ status: "ready", progress: null }),

      setError: (error) =>
        set({ status: "error", error }),

      reset: () =>
        set({ status: "idle", info: null, progress: null, error: null }),
    }),
    { name: "updater-store" }
  )
);
