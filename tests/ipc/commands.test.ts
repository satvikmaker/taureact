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
});
