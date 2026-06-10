import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BinanceConnectForm } from "./binance-connect-form";
import { ApiClientError } from "@/lib/api/errors";

const storeMutateAsync = vi.fn();

vi.mock("@/features/exchanges/use-exchange-connections", () => ({
  useStoreBinanceConnectionMutation: () => ({
    mutateAsync: storeMutateAsync,
    isPending: false,
  }),
}));

const TEST_API_KEY = "testapikey1234567890ab";
const TEST_API_SECRET = "supersecretvalueforkey12";

function fillConnectForm() {
  fireEvent.change(screen.getByLabelText("Binance API key"), { target: { value: TEST_API_KEY } });
  fireEvent.change(screen.getByLabelText("Binance API secret"), {
    target: { value: TEST_API_SECRET },
  });
}

describe("BinanceConnectForm", () => {
  beforeEach(() => {
    storeMutateAsync.mockReset();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("renders only label, api key, api secret, and Connect Binance button", () => {
    render(<BinanceConnectForm />);

    expect(screen.getByLabelText("Connection label (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Binance API key")).toBeInTheDocument();
    expect(screen.getByLabelText("Binance API secret")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Connect Binance/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Current password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Validate$/i })).not.toBeInTheDocument();
  });

  it("submits the correct payload", async () => {
    storeMutateAsync.mockResolvedValue({
      connection: { id: "1", label: "spider" },
      warning: null,
    });

    render(<BinanceConnectForm />);
    fireEvent.change(screen.getByLabelText("Connection label (optional)"), {
      target: { value: "spider" },
    });
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(storeMutateAsync).toHaveBeenCalledWith({
        label: "spider",
        api_key: TEST_API_KEY,
        api_secret: TEST_API_SECRET,
      });
    });
  });

  it("clears secret after successful connect and shows success message", async () => {
    storeMutateAsync.mockResolvedValue({
      connection: { id: "1", label: "spider", masked_api_key: "abc***************xyz" },
      warning: null,
    });

    render(<BinanceConnectForm />);
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Binance API secret")).toHaveValue("");
      expect(screen.getByText("Binance connected successfully.")).toBeInTheDocument();
    });
  });

  it("shows withdrawal warning when backend returns one", async () => {
    storeMutateAsync.mockResolvedValue({
      connection: { id: "1" },
      warning:
        "Withdrawal permission appears to be enabled. For safety, disable withdrawal permission in Binance API settings.",
    });

    render(<BinanceConnectForm />);
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(screen.getByText(/Withdrawal permission appears to be enabled/i)).toBeInTheDocument();
    });
  });

  it("shows visible error for 422 validation", async () => {
    storeMutateAsync.mockRejectedValue(
      new ApiClientError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        retryable: false,
        fieldErrors: { api_key: ["The api key field is required."] },
      }),
    );

    render(<BinanceConnectForm />);
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(screen.getByText("Please enter your Binance API key and secret.")).toBeInTheDocument();
    });
  });

  it("shows visible error for invalid credentials", async () => {
    storeMutateAsync.mockRejectedValue(
      new ApiClientError("Binance API key or secret is invalid.", {
        status: 422,
        code: "BINANCE_API_INVALID",
        retryable: false,
      }),
    );

    render(<BinanceConnectForm />);
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(screen.getByText("Binance API key or secret is invalid.")).toBeInTheDocument();
    });
  });

  it("does not store api secret in localStorage or sessionStorage", async () => {
    storeMutateAsync.mockResolvedValue({
      connection: { id: "1" },
      warning: null,
    });

    render(<BinanceConnectForm />);
    fillConnectForm();
    fireEvent.click(screen.getByRole("button", { name: /Connect Binance/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Binance API secret")).toHaveValue("");
    });

    expect(localStorage.getItem(TEST_API_SECRET)).toBeNull();
    expect(sessionStorage.getItem(TEST_API_SECRET)).toBeNull();
  });
});
