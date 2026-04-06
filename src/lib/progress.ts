import { ipc } from "@/ipc";

/**
 * Set the OS taskbar/dock progress indicator.
 * @param value 0.0–1.0 for progress, null to clear.
 */
export function setProgress(value: number | null): Promise<void> {
  return ipc.setProgress(value);
}
