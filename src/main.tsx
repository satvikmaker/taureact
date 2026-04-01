import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/components";
import { ipc } from "@/ipc";
import App from "./App";
import "./index.css";

// ── Global error handlers ────────────────────────────────────────────
window.onerror = (_msg, _source, _lineno, _colno, error) => {
  ipc
    .reportError({
      message: error?.message ?? "Unknown error",
      stack: error?.stack,
    })
    .catch(console.error);
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  ipc
    .reportError({
      message: reason?.message ?? String(reason),
      stack: reason?.stack,
    })
    .catch(console.error);
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
// Signal to Rust that the frontend has mounted. This closes the splash
// window and shows the main window.
ipc.appReady().catch(console.error);
