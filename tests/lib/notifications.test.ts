import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isPermissionGranted,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { notify } from "@/lib/notifications";

describe("notify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends notification when permission is granted", async () => {
    vi.mocked(isPermissionGranted).mockResolvedValueOnce(true);

    await notify("Test Title", "Test Body");

    expect(sendNotification).toHaveBeenCalledWith({
      title: "Test Title",
      body: "Test Body",
    });
  });

  it("does not send notification when permission is denied", async () => {
    vi.mocked(isPermissionGranted).mockResolvedValueOnce(false);
    const { requestPermission } = await import(
      "@tauri-apps/plugin-notification"
    );
    vi.mocked(requestPermission).mockResolvedValueOnce("denied" as never);

    await notify("Test Title", "Test Body");

    expect(sendNotification).not.toHaveBeenCalled();
  });
});
