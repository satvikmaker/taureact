import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { ipc, ipcListen } from "@/ipc";

export interface ContextMenuAction {
  id: string;
  label: string;
  disabled?: boolean;
  separatorBefore?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  actions: ContextMenuAction[];
  children: ReactNode;
  className?: string;
  /** Use the native OS context menu instead of the web-based one. */
  native?: boolean;
}

/**
 * Right-click context menu component.
 *
 * `native={false}` (default): App-themed Tailwind menu rendered in React.
 * `native={true}`: Uses the Tauri native popup menu via IPC. Selection
 * is received via the `context-menu:selected` event.
 */
export function ContextMenu({
  actions,
  children,
  className = "",
  native = false,
}: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  // ── Native menu path ───────────────────────────────────────────────
  useEffect(() => {
    if (!native) return;
    const unlisten = ipcListen("context-menu:selected", (id) => {
      const action = actionsRef.current.find((a) => a.id === id);
      if (action) action.onClick();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [native]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (native) {
        // Delegate to Rust native context menu
        ipc
          .showContextMenu(
            "main",
            actions.map((a) => ({
              id: a.id,
              label: a.label,
              disabled: a.disabled,
              separatorBefore: a.separatorBefore,
            }))
          )
          .catch(console.error);
      } else {
        setPos({ x: e.clientX, y: e.clientY });
      }
    },
    [native, actions]
  );

  const close = useCallback(() => setPos(null), []);

  // ── Web menu: clamp position to viewport ───────────────────────────
  useEffect(() => {
    if (!pos || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    let { x, y } = pos;
    const pad = 4;

    if (x + rect.width > window.innerWidth - pad) {
      x = window.innerWidth - rect.width - pad;
    }
    if (y + rect.height > window.innerHeight - pad) {
      y = window.innerHeight - rect.height - pad;
    }
    if (x < pad) x = pad;
    if (y < pad) y = pad;

    if (x !== pos.x || y !== pos.y) {
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [pos]);

  // ── Web menu: close on click outside or Escape ─────────────────────
  useEffect(() => {
    if (!pos) return;
    const handleClick = () => close();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [pos, close]);

  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
      {/* Web-based menu (only when not native) */}
      {!native && pos && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg"
          style={{ left: pos.x, top: pos.y }}
        >
          {actions.map((action) => (
            <div key={action.id}>
              {action.separatorBefore && (
                <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
              )}
              <button
                className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                  action.disabled
                    ? "text-zinc-400 dark:text-zinc-600 cursor-default"
                    : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                }`}
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  action.onClick();
                }}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
