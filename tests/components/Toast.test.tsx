import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/Toast";

function ToastTrigger({ message, variant }: { message: string; variant?: "info" | "success" | "error" | "warning" }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, { variant })}>Trigger</button>;
}

describe("Toast", () => {
  it("shows toast message when triggered", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Test toast" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Test toast")).toBeInTheDocument();
  });

  it("dismisses toast when X is clicked", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Dismiss me" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Dismiss me")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("supports different variants", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Success!" variant="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Trigger"));
    const toast = screen.getByText("Success!").closest("div");
    expect(toast?.className).toContain("bg-green-600");
  });
});
