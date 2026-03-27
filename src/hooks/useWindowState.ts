import { useEffect, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/store";
import { ipcListen } from "@/ipc";

/**
 * Syncs window maximized state from Tauri events into the app store.
 * Returns the current state and window control actions.
 */
export function useWindowState() {
  const isMaximized = useAppStore((s) => s.isMaximized);
  const setMaximized = useAppStore((s) => s.setMaximized);

  useEffect(() => {
    getCurrentWindow()
      .isMaximized()
      .then(setMaximized)
      .catch(console.error);

    const unlisten = ipcListen("window:maximized-changed", setMaximized);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setMaximized]);

  const controls = useMemo(
    () => ({
      minimize: () => getCurrentWindow().minimize(),
      maximize: () => getCurrentWindow().toggleMaximize(),
      close: () => getCurrentWindow().close(),
    }),
    []
  );

  return { isMaximized, ...controls };
}
