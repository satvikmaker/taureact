import { useEffect, useState } from "react";
import { ipcListen } from "@/ipc";

/**
 * Listens for `taureact://` deep link URLs received from the Rust backend.
 * Returns the most recent URL (or null if none received yet).
 *
 * Consumers can parse the URL and route accordingly:
 * ```ts
 * const url = useDeepLink();
 * useEffect(() => {
 *   if (url) {
 *     const parsed = new URL(url);
 *     // route based on parsed.pathname, parsed.searchParams, etc.
 *   }
 * }, [url]);
 * ```
 */
export function useDeepLink(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = ipcListen("deep-link:received", (payload) => {
      setUrl(payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return url;
}
