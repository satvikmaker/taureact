import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ipc } from "@/ipc";

import en from "./locales/en.json";
import es from "./locales/es.json";
import ja from "./locales/ja.json";

/** Detect the initial language: saved preference → OS locale → English. */
async function detectLanguage(): Promise<string> {
  try {
    const saved = (await ipc.settingsGet("language")) as string | null;
    if (saved) return saved;
  } catch {
    // First launch or IPC not ready
  }
  // Fall back to browser locale
  const browserLang = navigator.language.split("-")[0];
  if (["en", "es", "ja"].includes(browserLang)) return browserLang;
  return "en";
}

// Initialize synchronously with English, then detect async
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ja: { translation: ja },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Detect and apply saved language preference
detectLanguage().then((lng) => {
  i18n.changeLanguage(lng);
});

export default i18n;
