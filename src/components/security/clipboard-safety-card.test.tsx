import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClipboardSafetyCard } from "./ClipboardSafetyCard";

const pushToast = vi.fn();

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

describe("ClipboardSafetyCard", () => {
  beforeEach(() => {
    pushToast.mockClear();
  });

  it("does not render when visible is false", () => {
    render(<ClipboardSafetyCard visible={false} />);
    expect(screen.queryByText(/Protect your Binance API secret/)).not.toBeInTheDocument();
  });

  it("renders safe text starting with PROSPEROFY_SAFE_CLIPBOARD_ when visible", () => {
    render(<ClipboardSafetyCard visible />);
    const input = screen.getByLabelText(/Harmless clipboard replacement text/i) as HTMLInputElement;
    expect(input.value).toMatch(/^PROSPEROFY_SAFE_CLIPBOARD_/);
  });

  it("copies safe text to clipboard on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ClipboardSafetyCard visible />);
    const input = screen.getByLabelText(/Harmless clipboard replacement text/i) as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "Replace clipboard with safe text" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(input.value);
      expect(input.value).toMatch(/^PROSPEROFY_SAFE_CLIPBOARD_/);
    });
    expect(pushToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Clipboard replaced with safe text.",
    });
  });

  it("never receives or renders API key or secret props", () => {
    render(<ClipboardSafetyCard visible />);
    expect(screen.queryByDisplayValue(/supersecret/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/api_key/i)).not.toBeInTheDocument();
  });

  it("shows manual fallback when clipboard access fails", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });

    render(<ClipboardSafetyCard visible />);
    fireEvent.click(screen.getByRole("button", { name: "Replace clipboard with safe text" }));

    await waitFor(() => {
      expect(
        screen.getByText(/Could not access clipboard automatically/i),
      ).toBeInTheDocument();
    });
  });

  it("shows manual fallback when clipboard API is unavailable", async () => {
    Object.assign(navigator, { clipboard: undefined });

    render(<ClipboardSafetyCard visible />);
    fireEvent.click(screen.getByRole("button", { name: "Replace clipboard with safe text" }));

    await waitFor(() => {
      expect(
        screen.getByText(/Could not access clipboard automatically/i),
      ).toBeInTheDocument();
    });
  });
});
