import { useEffect, useState, useCallback } from "react";
import { HashRouter, Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TitleBar, OfflineIndicator, UpdaterUI } from "@/components";
import { ToastProvider } from "@/components/Toast";
import {
  CommandPalette,
  useCommandActions,
} from "@/components/CommandPalette";
import { useThemeStore, useAppStore } from "@/store";
import { useShortcut, useDeepLink } from "@/hooks";
import { ipc } from "@/ipc";
import { initLogging } from "@/lib/logger";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AboutPage } from "@/pages/AboutPage";

function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateApp = useAppStore((s) => s.hydrate);
  const version = useAppStore((s) => s.version);
  const setVersion = useAppStore((s) => s.setVersion);
  const lastRoute = useAppStore((s) => s.lastRoute);
  const setPlatform = useAppStore((s) => s.setPlatform);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [cmdPaletteKey, setCmdPaletteKey] = useState(0);
  const [initialRouteRestored, setInitialRouteRestored] = useState(false);
  const commandActions = useCommandActions();

  useEffect(() => {
    hydrateTheme();
    hydrateApp().then(() => setInitialRouteRestored(true));
    ipc.getAppVersion().then(setVersion).catch(console.error);
    initLogging().catch(console.error);

    // Detect platform once and store for non-React access
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) setPlatform("macos");
    else if (ua.includes("win")) setPlatform("windows");
    else if (ua.includes("linux")) setPlatform("linux");
  }, [hydrateTheme, hydrateApp, setVersion, setPlatform]);

  // Restore last route after hydration
  useEffect(() => {
    if (initialRouteRestored && lastRoute && lastRoute !== "/") {
      navigate(lastRoute);
    }
  }, [initialRouteRestored]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist current route for crash recovery / session restore
  const location = useLocation();
  const setLastRoute = useAppStore((s) => s.setLastRoute);
  useEffect(() => {
    setLastRoute(location.pathname);
  }, [location.pathname, setLastRoute]);

  // Handle taureact:// deep links by navigating to the path
  const deepLinkUrl = useDeepLink();
  useEffect(() => {
    if (deepLinkUrl) {
      try {
        const url = new URL(deepLinkUrl);
        const path = url.pathname || url.hostname; // taureact://settings → hostname="settings"
        if (path) navigate(`/${path}`);
      } catch {
        // Malformed URL — ignore
      }
    }
  }, [deepLinkUrl, navigate]);

  // Command palette shortcut
  useShortcut(
    "CmdOrCtrl+K",
    "Open command palette",
    useCallback(() => {
      setCmdPaletteKey((k) => k + 1);
      setCmdPaletteOpen(true);
    }, [])
  );

  // Settings shortcut
  useShortcut(
    "CmdOrCtrl+,",
    "Open settings",
    useCallback(() => {
      window.location.hash = "#/settings";
    }, [])
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-900 dark:text-zinc-100"
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    }`;

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 antialiased transition-colors duration-200">
      {/* Skip to main content link for accessibility (#9) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[300] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <TitleBar />
      <OfflineIndicator />
      <UpdaterUI />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar nav ──────────────────────────────────────── */}
        <nav
          className="w-52 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 flex flex-col gap-1 overflow-y-auto"
          aria-label="Main navigation"
          role="navigation"
        >
          <NavLink to="/" end className={navLinkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t("nav.settings")}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("nav.about")}
          </NavLink>

          {/* Version at bottom */}
          <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 px-3">
              {t("app.title")} {t("app.version", { version })}
            </p>
          </div>
        </nav>

        {/* ── Main content ─────────────────────────────────────── */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-8 py-6"
          role="main"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>

      {/* Command palette overlay */}
      <CommandPalette
        key={cmdPaletteKey}
        open={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        actions={commandActions}
      />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </HashRouter>
  );
}

export default App;
