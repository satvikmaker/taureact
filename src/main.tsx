import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components";
import { ipc } from "@/ipc";
import { reportCrash } from "@/lib/crash-reporter";
import App from "./App";
import "./i18n";
import "./index.css";

// ── Global error handlers (wired to crash reporter #8) ───────────────
window.onerror = (_msg, _source, _lineno, _colno, error) => {
  reportCrash({
    message: error?.message ?? "Unknown error",
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  reportCrash({
    message: reason?.message ?? String(reason),
    stack: reason?.stack,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
};

// ── Render ───────────────────────────────────────────────────────────
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// ── Dismiss splash screen ────────────────────────────────────────────
ipc.appReady().catch(console.error);
