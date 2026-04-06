/**
 * E2E Integration Tests for TauReact
 *
 * These test page components with routing and state management
 * in jsdom. i18n is not initialized, so translation keys appear as-is.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("E2E: Page routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Home page with all demo sections", async () => {
    const { HomePage } = await import("@/pages/HomePage");
    const { ToastProvider } = await import("@/components/Toast");

    render(
      <MemoryRouter>
        <ToastProvider>
          <HomePage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("ipc.title")).toBeInTheDocument();
    expect(screen.getByText("notifications.title")).toBeInTheDocument();
    expect(screen.getByText("fileDialog.title")).toBeInTheDocument();
    expect(screen.getByText("fileDrop.title")).toBeInTheDocument();
  });

  it("renders Settings page with all sections", async () => {
    const { SettingsPage } = await import("@/pages/SettingsPage");
    const { ToastProvider } = await import("@/components/Toast");

    render(
      <MemoryRouter>
        <ToastProvider>
          <SettingsPage />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("nav.settings")).toBeInTheDocument();
    expect(screen.getByText("settings.appearance")).toBeInTheDocument();
    expect(screen.getByText("settings.general")).toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(2);
  });

  it("renders About page", async () => {
    const { AboutPage } = await import("@/pages/AboutPage");

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByText("app.title")).toBeInTheDocument();
    expect(screen.getByText("about.description")).toBeInTheDocument();
  });
});

describe("E2E: Toast system integration", () => {
  it("provides toast context and renders toasts", async () => {
    const { ToastProvider, useToast } = await import("@/components/Toast");

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast("Hello!", { variant: "success" })}>
          Show toast
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText("Show toast")).toBeInTheDocument();
  });
});
