import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUpdaterStore } from "@/store/updaterStore";
import { UpdaterUI } from "@/components/UpdaterUI";

describe("UpdaterUI", () => {
  beforeEach(() => {
    useUpdaterStore.getState().reset();
  });

  it("renders nothing when idle", () => {
    const { container } = render(<UpdaterUI />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when checking", () => {
    useUpdaterStore.setState({ status: "checking" });
    const { container } = render(<UpdaterUI />);
    expect(container.innerHTML).toBe("");
  });

  it("shows available update info", () => {
    useUpdaterStore.setState({
      status: "available",
      info: { version: "2.0.0" },
    });
    render(<UpdaterUI />);
    expect(screen.getByText(/Update available: v2\.0\.0/)).toBeInTheDocument();
  });

  it("shows download progress bar", () => {
    useUpdaterStore.setState({
      status: "downloading",
      progress: { total: 1000, transferred: 500 },
    });
    render(<UpdaterUI />);
    expect(screen.getByText("Downloading update...")).toBeInTheDocument();
  });

  it("shows ready state with restart button", () => {
    useUpdaterStore.setState({ status: "ready" });
    render(<UpdaterUI />);
    expect(screen.getByText("Update ready to install")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows error state", () => {
    useUpdaterStore.setState({ status: "error", error: "Network error" });
    render(<UpdaterUI />);
    expect(screen.getByText("Update failed")).toBeInTheDocument();
  });
});
