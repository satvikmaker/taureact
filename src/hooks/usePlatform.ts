import { useSyncExternalStore } from "react";

type Platform = "macos" | "windows" | "linux" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}

let cachedPlatform: Platform | null = null;

function getSnapshot(): Platform {
  if (!cachedPlatform) {
    cachedPlatform = detectPlatform();
  }
  return cachedPlatform;
}

function subscribe(_callback: () => void): () => void {
  // Platform never changes at runtime
  return () => {};
}

/** Reactive hook that returns the OS platform. */
export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, getSnapshot, () => "unknown" as Platform);
}
