"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/system/form-field";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { useStoreBinanceConnectionMutation } from "@/features/exchanges/use-exchange-connections";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { isApiClientError } from "@/lib/api/errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";

const schema = z.object({
  label: z.string().max(100).optional(),
  api_key: z.string().min(1, "API key is required.").max(500),
  api_secret: z.string().min(1, "API secret is required.").max(500),
});

type FormValues = z.infer<typeof schema>;

const SECURITY_TIP =
  "Security tip: Use a dedicated Binance API key for Prosperofy. Keep withdrawal permission disabled.";

function connectErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (
      error.status === 422 &&
      (error.code === "VALIDATION_ERROR" ||
        error.fieldErrors.api_key ||
        error.fieldErrors.api_secret)
    ) {
      return "Please enter your Binance API key and secret.";
    }
    if (error.code === "BINANCE_API_INVALID") {
      return "Binance API key or secret is invalid.";
    }
    if (error.code === "BINANCE_API_UNAVAILABLE" || error.code === "BINANCE_API_TIMEOUT") {
      return "Binance is temporarily unavailable. Please try again.";
    }
  }

  return friendlySettingsError(error);
}

export type BinanceConnectFormProps = {
  onSaved?: () => void;
};

export function BinanceConnectForm({ onSaved }: BinanceConnectFormProps) {
  const storeMut = useStoreBinanceConnectionMutation();
  const [showSecret, setShowSecret] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      api_key: "",
      api_secret: "",
    },
  });

  async function onConnect(values: FormValues) {
    setSuccessMessage(null);
    setWarningMessage(null);
    setErrorMessage(null);

    try {
      const result = await storeMut.mutateAsync({
        label: values.label?.trim() || null,
        api_key: values.api_key.trim(),
        api_secret: values.api_secret.trim(),
      });

      form.setValue("api_secret", "");
      form.setValue("api_key", "");
      setShowSecret(false);

      setSuccessMessage("Binance connected successfully.");
      setWarningMessage(result.warning ?? null);

      onSaved?.();
    } catch (e) {
      if (mergeServerFieldErrors(e, form.setError)) {
        setErrorMessage(connectErrorMessage(e));
        return;
      }
      setErrorMessage(connectErrorMessage(e));
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onConnect)}
      className="space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-5"
    >
      <h3 className="text-sm font-semibold text-foreground">Connect Binance</h3>

      {successMessage ? <InlineAlert tone="success">{successMessage}</InlineAlert> : null}
      {warningMessage ? <InlineAlert tone="warning">{warningMessage}</InlineAlert> : null}
      {errorMessage ? <InlineAlert tone="error">{errorMessage}</InlineAlert> : null}

      <InlineAlert tone="info">{SECURITY_TIP}</InlineAlert>

      <FormField id="bn-label" label="Connection label (optional)" error={form.formState.errors.label?.message}>
        <input
          id="bn-label"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          autoComplete="off"
          placeholder="Binance"
          {...form.register("label")}
        />
      </FormField>

      <FormField id="bn-key" label="Binance API key" error={form.formState.errors.api_key?.message}>
        <input
          id="bn-key"
          type="password"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          autoComplete="off"
          {...form.register("api_key")}
        />
      </FormField>

      <FormField id="bn-secret" label="Binance API secret" error={form.formState.errors.api_secret?.message}>
        <div className="flex gap-2">
          <input
            id="bn-secret"
            type={showSecret ? "text" : "password"}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            autoComplete="off"
            {...form.register("api_secret")}
          />
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2 text-xs text-foreground"
            onClick={() => setShowSecret((v) => !v)}
          >
            {showSecret ? "Hide" : "Show"}
          </button>
        </div>
      </FormField>

      <SubmitButton pending={storeMut.isPending}>Connect Binance</SubmitButton>
    </form>
  );
}
