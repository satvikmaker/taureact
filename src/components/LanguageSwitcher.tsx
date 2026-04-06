import { useTranslation } from "react-i18next";
import { ipc } from "@/ipc";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espa\u00f1ol" },
  { code: "ja", label: "\u65e5\u672c\u8a9e" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    ipc.settingsSet("language", code).catch(console.error);
  };

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-all ${
            i18n.language === lang.code
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          onClick={() => changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
