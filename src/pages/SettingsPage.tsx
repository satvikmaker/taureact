import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components";
import { useToast } from "@/components/Toast";
import { useThemeStore } from "@/store";
import { autostart } from "@/lib/autostart";
import { configureCrashReporter } from "@/lib/crash-reporter";
import { ipc } from "@/ipc";

export function SettingsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const [autoLaunch, setAutoLaunch] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);

  useEffect(() => {
    autostart.isEnabled().then(setAutoLaunch).catch(() => {});
    ipc
      .settingsGet("telemetry_enabled")
      .then((v) => {
        if (v !== null && v !== undefined) {
          const enabled = v as boolean;
          setTelemetryEnabled(enabled);
          configureCrashReporter({ enabled });
        }
      })
      .catch(() => {});
  }, []);

  const handleAutoLaunchToggle = async () => {
    try {
      const newState = await autostart.toggle();
      setAutoLaunch(newState);
      toast(
        newState ? "Auto-launch enabled" : "Auto-launch disabled",
        { variant: "success" }
      );
    } catch {
      toast("Failed to toggle auto-launch", { variant: "error" });
    }
  };

  const handleTelemetryToggle = async () => {
    const next = !telemetryEnabled;
    setTelemetryEnabled(next);
    configureCrashReporter({ enabled: next });
    await ipc.settingsSet("telemetry_enabled", next).catch(console.error);
    toast(
      next ? "Telemetry enabled" : "Telemetry disabled",
      { variant: "info" }
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("nav.settings")}</h1>

      {/* ── Appearance ────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">
          {t("settings.appearance")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("theme.title")}
            </label>
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
              {(["light", "dark", "system"] as const).map((m) => (
                <button
                  key={m}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-all ${
                    mode === m
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  onClick={() => {
                    setMode(m);
                    toast(`Theme set to ${m}`, { variant: "success" });
                  }}
                >
                  {t(`theme.${m}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("language.title")}
            </label>
            <LanguageSwitcher />
          </div>
        </div>
      </section>

      {/* ── General ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">
          {t("settings.general")}
        </h2>
        <div className="space-y-3">
          <SettingsToggle
            label={t("settings.autoLaunch")}
            description={t("settings.autoLaunchDesc")}
            checked={autoLaunch}
            onChange={handleAutoLaunchToggle}
          />
          <SettingsToggle
            label={t("settings.telemetry")}
            description={t("settings.telemetryDesc")}
            checked={telemetryEnabled}
            onChange={handleTelemetryToggle}
          />
        </div>
      </section>
    </div>
  );
}

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
