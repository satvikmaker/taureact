import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUpdaterStore } from "@/store";
import { ipcListen } from "@/ipc";
import { relaunch } from "@tauri-apps/plugin-process";

export function UpdaterUI() {
  const { t } = useTranslation();
  const status = useUpdaterStore((s) => s.status);
  const info = useUpdaterStore((s) => s.info);
  const progress = useUpdaterStore((s) => s.progress);
  const error = useUpdaterStore((s) => s.error);
  const setAvailable = useUpdaterStore((s) => s.setAvailable);
  const setProgress = useUpdaterStore((s) => s.setProgress);
  const setDownloaded = useUpdaterStore((s) => s.setDownloaded);
  const setError = useUpdaterStore((s) => s.setError);

  useEffect(() => {
    const unsubs = [
      ipcListen("updater:available", setAvailable),
      ipcListen("updater:progress", setProgress),
      ipcListen("updater:downloaded", () => setDownloaded()),
      ipcListen("updater:error", (payload) => setError(payload.message)),
    ];

    return () => {
      unsubs.forEach((p) => p.then((fn) => fn()));
    };
  }, [setAvailable, setProgress, setDownloaded, setError]);

  if (status === "idle" || status === "checking") return null;

  return (
    <div
      className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-[13px]"
      role="alert"
    >
      {status === "available" && info && (
        <div className="flex items-center gap-3">
          <span>{t("updater.available", { version: info.version })}</span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {t("updater.downloading")}
          </span>
        </div>
      )}

      {status === "downloading" && progress && (
        <div className="flex items-center gap-3">
          <span>{t("updater.downloading")}</span>
          <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-[width] duration-200"
              style={{
                width: `${progress.total > 0 ? (progress.transferred / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="flex items-center gap-3">
          <span>{t("updater.ready")}</span>
          <button
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs cursor-pointer transition-colors"
            onClick={() => relaunch().catch(console.error)}
          >
            {t("updater.restart")}
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 text-red-500">
          <span>
            {t("updater.failed")}
            {error ? `: ${error}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
