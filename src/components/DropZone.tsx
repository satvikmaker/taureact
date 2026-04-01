import { useState, useEffect, useRef, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ipc, type FileMetadata } from "@/ipc";

export interface DroppedImage {
  meta: FileMetadata;
  previewUrl: string; // blob: URL for rendering in <img>
}

interface DropZoneProps {
  onDrop: (images: DroppedImage[]) => void;
  children?: ReactNode;
  className?: string;
  accept?: string[];
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"];

function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

export function DropZone({
  onDrop,
  children,
  className = "",
  accept = IMAGE_EXTENSIONS,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const onDropRef = useRef(onDrop);
  const acceptRef = useRef(accept);

  useEffect(() => {
    onDropRef.current = onDrop;
    acceptRef.current = accept;
  });

  useEffect(() => {
    const unlisten = getCurrentWindow().onDragDropEvent(async (event) => {
      const payload = event.payload;

      if (payload.type === "enter" || payload.type === "over") {
        setIsDragging(true);
        return;
      }

      if (payload.type === "leave") {
        setIsDragging(false);
        return;
      }

      if (payload.type === "drop") {
        setIsDragging(false);

        // Filter to accepted image extensions
        const paths = payload.paths
          .map((p) => (typeof p === "string" ? p : String(p)))
          .filter((p) => {
            const lower = p.toLowerCase();
            return acceptRef.current.some((ext) => lower.endsWith(ext.toLowerCase()));
          });

        if (!paths.length) return;

        try {
          const metadata = await ipc.getFileMetadata(paths);

          // Read each file via Rust and create blob URLs for preview
          const images: DroppedImage[] = await Promise.all(
            metadata.map(async (meta) => {
              const bytes = await ipc.readFileBytes(meta.path);
              const blob = new Blob([bytes], { type: mimeFromPath(meta.path) });
              return { meta, previewUrl: URL.createObjectURL(blob) };
            })
          );

          onDropRef.current(images);
        } catch (err) {
          console.error("Failed to process dropped files:", err);
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-500/5"
          : "border-zinc-300 dark:border-zinc-600"
      } ${className}`}
    >
      {children ?? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isDragging
            ? "Drop images here"
            : "Drag & drop images here to preview"}
        </p>
      )}
    </div>
  );
}
