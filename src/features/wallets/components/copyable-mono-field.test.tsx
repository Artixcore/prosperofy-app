import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyableMonoField } from "./copyable-mono-field";

const pushToast = vi.fn();

vi.mock("@/components/system/toast-context", () => ({
  useToast: () => ({ pushToast }),
}));

describe("CopyableMonoField", () => {
  it("copies full tx hash on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <CopyableMonoField
        label="Tx hash"
        value="fullhashvalue123456789"
        shorten={(v) => `${v.slice(0, 4)}…`}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /copy/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("fullhashvalue123456789");
    });
  });
});
