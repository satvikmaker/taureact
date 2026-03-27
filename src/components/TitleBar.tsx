import { useWindowState, usePlatform } from "@/hooks";

export function TitleBar() {
  const platform = usePlatform();
  const { isMaximized, minimize, maximize, close } = useWindowState();

  // macOS uses native traffic lights — only render custom buttons on Windows/Linux
  if (platform === "macos") {
    return (
      <div
        className="flex items-center justify-center h-[38px] pl-[78px] pr-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 select-none"
        data-tauri-drag-region
      >
        <span
          className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400"
          data-tauri-drag-region
        >
          TauReact
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between h-[38px] px-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 select-none"
      data-tauri-drag-region
    >
      <span
        className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400"
        data-tauri-drag-region
      >
        TauReact
      </span>
      <div className="flex gap-0.5">
        <button
          className="flex items-center justify-center w-9 h-7 border-none bg-transparent text-zinc-900 dark:text-zinc-100 cursor-pointer rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          onClick={() => minimize().catch(console.error)}
          aria-label="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="flex items-center justify-center w-9 h-7 border-none bg-transparent text-zinc-900 dark:text-zinc-100 cursor-pointer rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          onClick={() => maximize().catch(console.error)}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M2 0h6v2h2v6H8v2H0V4h2V0zm1 1v1h5v5h1V1H3zm-2 3v5h6V4H1z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect
                width="9"
                height="9"
                x="0.5"
                y="0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          )}
        </button>
        <button
          className="flex items-center justify-center w-9 h-7 border-none bg-transparent text-zinc-900 dark:text-zinc-100 cursor-pointer rounded hover:bg-red-500 hover:text-white"
          onClick={() => close().catch(console.error)}
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M1 0l4 4 4-4 1 1-4 4 4 4-1 1-4-4-4 4-1-1 4-4-4-4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
