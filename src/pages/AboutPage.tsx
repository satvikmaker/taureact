import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store";

export function AboutPage() {
  const { t } = useTranslation();
  const version = useAppStore((s) => s.version);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
        <span className="text-3xl font-bold text-white">T</span>
      </div>
      <h1 className="text-2xl font-bold">{t("app.title")}</h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        {t("app.version", { version })}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        {t("about.description")}
      </p>
      <div className="text-xs text-zinc-400 dark:text-zinc-500 space-y-1 mt-4">
        <p>Tauri 2 + React 19 + TypeScript + Tailwind CSS</p>
        <p>Zustand + i18next + SQLite</p>
      </div>
    </div>
  );
}
