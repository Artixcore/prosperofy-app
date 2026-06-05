"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/system/form-field";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import {
  useStoreBinanceConnectionMutation,
  useValidateBinanceConnectionMutation,
} from "@/features/exchanges/use-exchange-connections";
import type { BinanceValidationPreview } from "@/lib/api/types";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";

const schema = z
  .object({
    label: z.string().max(80).optional(),
    api_key: z.string().min(20, "API key must be at least 20 characters.").max(255),
    api_secret: z.string().min(20, "API secret must be at least 20 characters.").max(255),
    mode: z.enum(["portfolio_only", "trading"]),
    accepted_terms: z.boolean(),
    trading_risk_ack: z.boolean(),
    no_withdrawal_ack: z.boolean(),
    verify_password: z.string().optional(),
    verify_passphrase: z.string().optional(),
    verify_otp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.accepted_terms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must accept the terms to continue.",
        path: ["accepted_terms"],
      });
    }
    if (!data.no_withdrawal_ack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm that withdrawal permission is not enabled.",
        path: ["no_withdrawal_ack"],
      });
    }
    if (data.mode === "trading" && !data.trading_risk_ack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm that you understand trading risks.",
        path: ["trading_risk_ack"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export type BinanceConnectFormProps = {
  onSaved?: () => void;
  onValidated?: (preview: BinanceValidationPreview) => void;
};

export function BinanceConnectForm({ onSaved, onValidated }: BinanceConnectFormProps) {
  const validateMut = useValidateBinanceConnectionMutation();
  const storeMut = useStoreBinanceConnectionMutation();
  const [showSecret, setShowSecret] = useState(false);
  const [preview, setPreview] = useState<BinanceValidationPreview | null>(null);
  const [banner, setBanner] = useState<{ tone: "success" | "error" | "warning"; message: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      api_key: "",
      api_secret: "",
      mode: "portfolio_only",
      accepted_terms: false,
      trading_risk_ack: false,
      no_withdrawal_ack: false,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    },
  });

  const pending = validateMut.isPending || storeMut.isPending;

  function clearSecretField() {
    form.setValue("api_secret", "");
    setShowSecret(false);
  }

  async function onValidate() {
    setBanner(null);
    setPreview(null);
    const values = form.getValues();
    const parsed = schema.safeParse({ ...values, verify_password: undefined, verify_passphrase: undefined, verify_otp: undefined });
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof FormValues, { message: issue.message });
        }
      });
      return;
    }

    try {
      const result = await validateMut.mutateAsync({
        label: values.label?.trim() || null,
        api_key: values.api_key.trim(),
        api_secret: values.api_secret.trim(),
        mode: values.mode,
        accepted_terms: true,
      });
      setPreview(result);
      clearSecretField();
      if (result.can_withdraw) {
        setBanner({
          tone: "error",
          message:
            "Withdrawal permission is enabled. For safety, Prosperofy does not accept API keys with withdrawal permission.",
        });
      } else if (values.mode === "trading" && !result.can_trade) {
        setBanner({
          tone: "warning",
          message:
            "Your API key only has Reading permission. Portfolio view is available, but trading is disabled.",
        });
      } else {
        setBanner({
          tone: "success",
          message: result.message ?? "API validated successfully.",
        });
      }
      onValidated?.(result);
    } catch (e) {
      setBanner({ tone: "error", message: friendlySettingsError(e) });
    }
  }

  async function onSave(values: FormValues) {
    setBanner(null);
    const factors = {
      current_password: values.verify_password?.trim() || undefined,
      account_passphrase: values.verify_passphrase?.trim() || undefined,
      otp: values.verify_otp?.trim() || undefined,
    };
    const hasFactor =
      Boolean(factors.current_password) ||
      Boolean(factors.account_passphrase) ||
      Boolean(factors.otp);
    if (!hasFactor) {
      form.setError("verify_password", {
        message: "Provide your password, security passphrase, or authenticator code.",
      });
      return;
    }

    try {
      const result = await storeMut.mutateAsync({
        label: values.label?.trim() || null,
        api_key: values.api_key.trim(),
        api_secret: values.api_secret.trim(),
        mode: values.mode,
        accepted_terms: true,
        trading_risk_ack: values.mode === "trading" ? true : undefined,
        ...factors,
      });
      clearSecretField();
      form.reset({
        ...form.getValues(),
        api_key: "",
        api_secret: "",
        verify_password: "",
        verify_passphrase: "",
        verify_otp: "",
      });
      setBanner({
        tone: "success",
        message: result.connection?.label
          ? `Connection saved: ${result.connection.label}.`
          : "Binance connection saved.",
      });
      onSaved?.();
    } catch (e) {
      if (mergeServerFieldErrors(e, form.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(e) });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-5">
      <h3 className="text-sm font-semibold text-foreground">Connect Binance</h3>

      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      {preview?.warnings?.includes("ip_restriction_recommended") ? (
        <InlineAlert tone="info">
          Consider restricting your Binance API key to trusted Prosperofy backend IP addresses when
          available.
        </InlineAlert>
      ) : null}

      <FormField id="bn-label" label="Nickname (optional)" error={form.formState.errors.label?.message}>
        <input
          id="bn-label"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          autoComplete="off"
          {...form.register("label")}
        />
      </FormField>

      <FormField id="bn-key" label="API key" error={form.formState.errors.api_key?.message}>
        <input
          id="bn-key"
          type="password"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          autoComplete="off"
          {...form.register("api_key")}
        />
      </FormField>

      <FormField id="bn-secret" label="API secret" error={form.formState.errors.api_secret?.message}>
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

      <FormField id="bn-mode" label="Connection mode" error={form.formState.errors.mode?.message}>
        <select
          id="bn-mode"
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
          {...form.register("mode")}
        >
          <option value="portfolio_only">Portfolio only</option>
          <option value="trading">Trading enabled</option>
        </select>
      </FormField>

      <div className="space-y-2 rounded-md border border-surface-border bg-surface/50 p-3 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...form.register("accepted_terms")} />
          <span>I understand API keys can be revoked from Binance at any time.</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...form.register("no_withdrawal_ack")} />
          <span>My API key does not have withdrawal permission enabled.</span>
        </label>
        {form.watch("mode") === "trading" ? (
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" {...form.register("trading_risk_ack")} />
            <span>I understand the risks of enabling trading through Prosperofy.</span>
          </label>
        ) : null}
      </div>

      <div className="rounded-md border border-surface-border bg-surface/50 p-3">
        <p className="text-xs font-medium text-foreground">Verify your identity (required to save)</p>
        <FormField id="bn-vp" label="Current password" error={form.formState.errors.verify_password?.message}>
          <input
            id="bn-vp"
            type="password"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            autoComplete="current-password"
            {...form.register("verify_password")}
          />
        </FormField>
        <FormField id="bn-vph" label="Security passphrase" error={form.formState.errors.verify_passphrase?.message}>
          <input
            id="bn-vph"
            type="password"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            autoComplete="off"
            {...form.register("verify_passphrase")}
          />
        </FormField>
        <FormField id="bn-vo" label="Authenticator code" error={form.formState.errors.verify_otp?.message}>
          <input
            id="bn-vo"
            inputMode="numeric"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            autoComplete="one-time-code"
            {...form.register("verify_otp")}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
          onClick={() => void onValidate()}
        >
          {validateMut.isPending ? "Validating…" : "Validate"}
        </button>
        <SubmitButton pending={storeMut.isPending || pending || preview?.can_withdraw === true}>
          Save connection
        </SubmitButton>
      </div>
    </form>
  );
}
