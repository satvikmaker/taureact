import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  DropZone,
  ContextMenu,
  type DroppedImage,
  type ContextMenuAction,
} from "@/components";
import { useToast } from "@/components/Toast";
import { ipc } from "@/ipc";
import { notify } from "@/lib/notifications";
import { openFile, saveFile } from "@/lib/dialogs";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HomePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [images, setImages] = useState<DroppedImage[]>([]);
  const [pingResult, setPingResult] = useState("");
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const handlePing = useCallback(async () => {
    try {
      const result = await ipc.ping();
      setPingResult(result);
      toast("Pong received!", { variant: "success" });
    } catch {
      toast("Ping failed", { variant: "error" });
    }
  }, [toast]);

  const handleImageDrop = useCallback((dropped: DroppedImage[]) => {
    setImages((prev) => [...prev, ...dropped]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleNotify = useCallback(() => {
    notify("TauReact", t("notifications.sent"));
    toast(t("notifications.sent"), { variant: "success" });
  }, [t, toast]);

  const handleOpenFile = useCallback(async () => {
    const result = await openFile({
      title: t("fileDialog.open"),
      multiple: true,
      filters: [
        { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    if (result) {
      const paths = Array.isArray(result) ? result : [result];
      setSelectedPaths(paths);
      toast(`Opened ${paths.length} file(s)`, { variant: "info" });
    }
  }, [t, toast]);

  const handleSaveFile = useCallback(async () => {
    const result = await saveFile({
      title: t("fileDialog.save"),
      filters: [{ name: "Text", extensions: ["txt"] }],
    });
    if (result) {
      setSelectedPaths([result]);
      toast("Save location selected", { variant: "success" });
    }
  }, [t, toast]);

  const imageContextActions: ContextMenuAction[] = [
    {
      id: "clear",
      label: "Clear all images",
      onClick: () => {
        images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
        toast("Images cleared", { variant: "info" });
      },
    },
  ];

  return (
    <>
      {/* ── IPC Demo ──────────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-base font-semibold mb-3 text-zinc-500 dark:text-zinc-400">
          {t("ipc.title")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium cursor-pointer transition-colors active:scale-[0.98]"
            onClick={handlePing}
          >
            {t("ipc.ping")}
          </button>
          <span className="text-xs text-zinc-400">(or Cmd/Ctrl+K)</span>
        </div>
        {pingResult && (
          <p className="mt-2 text-sm">
            {t("ipc.response")}{" "}
            <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[13px] font-mono">
              {pingResult}
            </code>
          </p>
        )}
      </section>

      {/* ── Notifications ─────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-base font-semibold mb-3 text-zinc-500 dark:text-zinc-400">
          {t("notifications.title")}
        </h2>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium cursor-pointer transition-colors active:scale-[0.98]"
          onClick={handleNotify}
        >
          {t("notifications.send")}
        </button>
      </section>

      {/* ── File Dialogs ──────────────────────────────────────── */}
      <section className="mb-7">
        <h2 className="text-base font-semibold mb-3 text-zinc-500 dark:text-zinc-400">
          {t("fileDialog.title")}
        </h2>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium cursor-pointer transition-colors active:scale-[0.98]"
            onClick={handleOpenFile}
          >
            {t("fileDialog.open")}
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 text-sm font-medium cursor-pointer transition-colors active:scale-[0.98]"
            onClick={handleSaveFile}
          >
            {t("fileDialog.save")}
          </button>
        </div>
        {selectedPaths.length > 0 && (
          <ul className="mt-2 text-sm space-y-1">
            {selectedPaths.map((p, i) => (
              <li key={i}>
                <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[13px] font-mono">
                  {p}
                </code>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Image Drop (with context menu) ────────────────────── */}
      <section className="mb-7">
        <h2 className="text-base font-semibold mb-3 text-zinc-500 dark:text-zinc-400">
          {t("fileDrop.title")}
        </h2>
        <DropZone onDrop={handleImageDrop} />
        {images.length > 0 && (
          <ContextMenu actions={imageContextActions}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 mt-4">
              {images.map((img, i) => (
                <div
                  key={`${img.meta.path}-${i}`}
                  className="group relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  <img
                    src={img.previewUrl}
                    alt={img.meta.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium truncate" title={img.meta.name}>
                      {img.meta.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatSize(img.meta.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label={`Remove ${img.meta.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </ContextMenu>
        )}
      </section>
    </>
  );
}
