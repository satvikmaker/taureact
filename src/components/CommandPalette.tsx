import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/store";

export interface CommandAction {
  id: string;
  label: string;
  category?: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

export function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query
    ? actions.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.category?.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  // Auto-focus input on mount (component is remounted via key when opened)
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].onSelect();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, selectedIndex, onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700 px-4">
          <svg
            className="w-4 h-4 text-zinc-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="text-[11px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-1" role="listbox">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-zinc-400 text-center">
              No results found
            </p>
          )}
          {filtered.map((action, i) => (
            <button
              key={action.id}
              role="option"
              aria-selected={i === selectedIndex}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left cursor-pointer transition-colors ${
                i === selectedIndex
                  ? "bg-blue-600 text-white"
                  : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              onClick={() => {
                action.onSelect();
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="flex items-center gap-3">
                {action.category && (
                  <span
                    className={`text-xs ${
                      i === selectedIndex
                        ? "text-blue-200"
                        : "text-zinc-400"
                    }`}
                  >
                    {action.category}
                  </span>
                )}
                <span>{action.label}</span>
              </span>
              {action.shortcut && (
                <kbd
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    i === selectedIndex
                      ? "bg-blue-700 text-blue-200"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {action.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Hook to build command palette actions from routes and app features. */
export function useCommandActions(): CommandAction[] {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return [
    {
      id: "nav-home",
      label: t("nav.home"),
      category: "Navigate",
      onSelect: () => navigate("/"),
    },
    {
      id: "nav-settings",
      label: t("nav.settings"),
      category: "Navigate",
      shortcut: "Cmd+,",
      onSelect: () => navigate("/settings"),
    },
    {
      id: "nav-about",
      label: t("nav.about"),
      category: "Navigate",
      onSelect: () => navigate("/about"),
    },
    {
      id: "theme-light",
      label: t("theme.light"),
      category: "Theme",
      onSelect: () => useThemeStore.getState().setMode("light"),
    },
    {
      id: "theme-dark",
      label: t("theme.dark"),
      category: "Theme",
      onSelect: () => useThemeStore.getState().setMode("dark"),
    },
    {
      id: "lang-en",
      label: "English",
      category: "Language",
      onSelect: () => i18n.changeLanguage("en"),
    },
    {
      id: "lang-es",
      label: "Espa\u00f1ol",
      category: "Language",
      onSelect: () => i18n.changeLanguage("es"),
    },
    {
      id: "lang-ja",
      label: "\u65e5\u672c\u8a9e",
      category: "Language",
      onSelect: () => i18n.changeLanguage("ja"),
    },
  ];
}
