import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { ipc } from "@/ipc/commands";

vi.mocked(invoke);

describe("ipc commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAppVersion invokes correct command", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("1.0.0");
    const result = await ipc.getAppVersion();
    expect(invoke).toHaveBeenCalledWith("get_app_version", {});
    expect(result).toBe("1.0.0");
  });

  it("getAppPath passes name argument", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("/home/user");
    await ipc.getAppPath("home");
    expect(invoke).toHaveBeenCalledWith("get_app_path", { name: "home" });
  });

  it("appReady invokes correct command", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.appReady();
    expect(invoke).toHaveBeenCalledWith("app_ready", {});
  });

  it("reportError passes error report", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.reportError({ message: "test error", stack: "stack trace" });
    expect(invoke).toHaveBeenCalledWith("report_error", {
      report: { message: "test error", stack: "stack trace" },
    });
  });

  it("settingsGet passes key", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("value");
    const result = await ipc.settingsGet("theme");
    expect(invoke).toHaveBeenCalledWith("settings_get", { key: "theme" });
    expect(result).toBe("value");
  });

  it("settingsSet passes key and value", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.settingsSet("theme", "dark");
    expect(invoke).toHaveBeenCalledWith("settings_set", {
      key: "theme",
      value: "dark",
    });
  });

  it("ping invokes correct command", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("pong");
    const result = await ipc.ping();
    expect(invoke).toHaveBeenCalledWith("ping", {});
    expect(result).toBe("pong");
  });

  it("getFileMetadata passes paths array", async () => {
    vi.mocked(invoke).mockResolvedValueOnce([]);
    await ipc.getFileMetadata(["/tmp/file.txt"]);
    expect(invoke).toHaveBeenCalledWith("get_file_metadata", {
      paths: ["/tmp/file.txt"],
    });
  });

  it("readFileBytes passes path", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(new ArrayBuffer(0));
    await ipc.readFileBytes("/tmp/img.png");
    expect(invoke).toHaveBeenCalledWith("read_file_bytes", {
      path: "/tmp/img.png",
    });
  });

  it("openWindow passes name and route", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.openWindow("secondary", "/details");
    expect(invoke).toHaveBeenCalledWith("open_window", {
      name: "secondary",
      route: "/details",
    });
  });

  it("showContextMenu passes window label and items", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.showContextMenu("main", [
      { id: "copy", label: "Copy" },
    ]);
    expect(invoke).toHaveBeenCalledWith("show_context_menu", {
      windowLabel: "main",
      items: [{ id: "copy", label: "Copy" }],
    });
  });

  it("secureSet passes key and value", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.secureSet("api-key", "secret123");
    expect(invoke).toHaveBeenCalledWith("secure_set", {
      key: "api-key",
      value: "secret123",
    });
  });

  it("secureGet passes key", async () => {
    vi.mocked(invoke).mockResolvedValueOnce("secret123");
    const result = await ipc.secureGet("api-key");
    expect(invoke).toHaveBeenCalledWith("secure_get", { key: "api-key" });
    expect(result).toBe("secret123");
  });

  it("secureDelete passes key", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.secureDelete("api-key");
    expect(invoke).toHaveBeenCalledWith("secure_delete", { key: "api-key" });
  });

  it("setProgress passes value", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.setProgress(0.5);
    expect(invoke).toHaveBeenCalledWith("set_progress", { value: 0.5 });
  });

  it("setProgress passes null to clear", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(undefined);
    await ipc.setProgress(null);
    expect(invoke).toHaveBeenCalledWith("set_progress", { value: null });
  });
});
