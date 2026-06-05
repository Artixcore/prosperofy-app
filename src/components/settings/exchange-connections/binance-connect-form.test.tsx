import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BinanceConnectForm } from "./binance-connect-form";

const validateMutateAsync = vi.fn();
const storeMutateAsync = vi.fn();

vi.mock("@/features/exchanges/use-exchange-connections", () => ({
  useValidateBinanceConnectionMutation: () => ({
    mutateAsync: validateMutateAsync,
    isPending: false,
  }),
  useStoreBinanceConnectionMutation: () => ({
    mutateAsync: storeMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

const TEST_API_KEY = "testapikey1234567890ab";
const TEST_API_SECRET = "supersecretvalueforkey12";

function fillValidateForm() {
  fireEvent.change(screen.getByLabelText("API key"), { target: { value: TEST_API_KEY } });
  fireEvent.change(screen.getByLabelText("API secret"), { target: { value: TEST_API_SECRET } });
  fireEvent.click(screen.getByRole("checkbox", { name: /revoked from Binance/i }));
  fireEvent.click(screen.getByRole("checkbox", { name: /withdrawal permission/i }));
}

describe("BinanceConnectForm clipboard safety", () => {
  beforeEach(() => {
    validateMutateAsync.mockReset();
    storeMutateAsync.mockReset();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("shows security reminder and clipboard card after successful validation", async () => {
    validateMutateAsync.mockResolvedValue({
      valid: true,
      can_withdraw: false,
      can_trade: true,
      message: "API validated successfully: spider. Binance UID: 123456789.",
    });

    render(<BinanceConnectForm />);
    fillValidateForm();
    fireEvent.click(screen.getByRole("button", { name: /^Validate$/i }));

    await waitFor(() => {
      expect(screen.getByText(/API validated successfully: spider/i)).toBeInTheDocument();
      expect(screen.getByText(/Security reminder:/)).toBeInTheDocument();
      expect(screen.getByText(/Protect your Binance API secret/)).toBeInTheDocument();
    });
  });

  it("clears api_secret after successful validation", async () => {
    validateMutateAsync.mockResolvedValue({
      valid: true,
      can_withdraw: false,
      can_trade: true,
      message: "API validated successfully.",
    });

    render(<BinanceConnectForm />);
    fillValidateForm();
    fireEvent.click(screen.getByRole("button", { name: /^Validate$/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("API secret")).toHaveValue("");
    });
  });

  it("clears api_key and api_secret after successful save", async () => {
    storeMutateAsync.mockResolvedValue({
      connection: { label: "spider", id: "1" },
    });

    render(<BinanceConnectForm />);
    fillValidateForm();
    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "SecretPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save connection/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("API key")).toHaveValue("");
      expect(screen.getByLabelText("API secret")).toHaveValue("");
      expect(screen.getByText(/Security reminder:/)).toBeInTheDocument();
    });
  });

  it("does not store api secret in localStorage or sessionStorage", async () => {
    validateMutateAsync.mockResolvedValue({
      valid: true,
      can_withdraw: false,
      can_trade: true,
      message: "API validated successfully.",
    });

    render(<BinanceConnectForm />);
    fillValidateForm();
    fireEvent.click(screen.getByRole("button", { name: /^Validate$/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("API secret")).toHaveValue("");
    });

    expect(localStorage.getItem(TEST_API_SECRET)).toBeNull();
    expect(sessionStorage.getItem(TEST_API_SECRET)).toBeNull();
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) {
        expect(localStorage.getItem(key)).not.toContain(TEST_API_SECRET);
      }
    }
  });
});
