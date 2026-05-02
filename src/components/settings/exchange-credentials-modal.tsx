"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/system/form-field";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import type { ExchangeProviderId } from "@/lib/api/types";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import {
  type ExchangeUpdateBody,
  useCreateExchangeConnectionMutation,
  useUpdateExchangeConnectionMutation,
} from "@/features/app/use-settings-security";

const SECURITY_WARNING =
  "For your safety, use read-only API keys and never enable withdrawal permissions.";

function schemaFor(mode: "create" | "update") {
  const creds =
    mode === "create"
      ? {
          api_key: z.string().min(1, "API key is required."),
          api_secret: z.string().min(1, "API secret is required."),
        }
      : {
          api_key: z.string().optional(),
          api_secret: z.string().optional(),
        };

  return z
    .object({
      ...creds,
      label: z.string().max(120).optional(),
      credential_passphrase: z.string().optional(),
      withdrawal_permission_ack: z.boolean(),
      verify_password: z.string().optional(),
      verify_passphrase: z.string().optional(),
      verify_otp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const rotating =
        mode === "create" ||
        (data.api_key?.trim().length ?? 0) > 0 ||
        (data.api_secret?.trim().length ?? 0) > 0 ||
        (data.credential_passphrase?.trim().length ?? 0) > 0;

      if (rotating && data.withdrawal_permission_ack !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must confirm before saving credentials.",
          path: ["withdrawal_permission_ack"],
        });
      }

      if (rotating) {
        const v =
          (data.verify_password?.trim().length ?? 0) > 0 ||
          (data.verify_passphrase?.trim().length ?? 0) > 0 ||
          (data.verify_otp?.trim().length ?? 0) > 0;
        if (!v) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Provide your password, security passphrase, or authenticator code.",
            path: ["verify_password"],
          });
        }
      }

      if (mode === "update" && rotating) {
        const hasK = (data.api_key?.trim().length ?? 0) > 0;
        const hasS = (data.api_secret?.trim().length ?? 0) > 0;
        if (hasK !== hasS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Provide both API key and API secret when rotating credentials.",
            path: ["api_key"],
          });
        }
      }
    });
}

export type ExchangeCredentialsModalProps = {
  open: boolean;
  onClose: () => void;
  exchange: ExchangeProviderId;
  mode: "create" | "update";
  connectionId?: string | null;
};

export function ExchangeCredentialsModal({
  open,
  onClose,
  exchange,
  mode,
  connectionId,
}: ExchangeCredentialsModalProps) {
  const createMut = useCreateExchangeConnectionMutation();
  const updateMut = useUpdateExchangeConnectionMutation();

  const schema = useMemo(() => schemaFor(mode), [mode]);
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      api_key: "",
      api_secret: "",
      credential_passphrase: "",
      withdrawal_permission_ack: false,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: "",
      api_key: "",
      api_secret: "",
      credential_passphrase: "",
      withdrawal_permission_ack: false,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    });
  }, [open, exchange, mode, form]);

  const exchangeTitle =
    exchange === "binance" ? "Binance" : exchange === "coinbase" ? "Coinbase" : "Bybit";

  async function onSubmit(values: FormValues) {
    const factors = {
      current_password: values.verify_password?.trim() || undefined,
      account_passphrase: values.verify_passphrase?.trim() || undefined,
      otp: values.verify_otp?.trim() || undefined,
    };

    const extra =
      exchange === "bybit" ? { extra: { account_type: "unified" as const } } : {};

    const rotating =
      mode === "create" ||
      (values.api_key?.trim().length ?? 0) > 0 ||
      (values.api_secret?.trim().length ?? 0) > 0 ||
      (values.credential_passphrase?.trim().length ?? 0) > 0;

    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          exchange,
          label: values.label?.trim() || null,
          api_key: values.api_key!.trim(),
          api_secret: values.api_secret!.trim(),
          passphrase: values.credential_passphrase?.trim() || null,
          withdrawal_permission_ack: true,
          ...factors,
          ...extra,
        });
      } else if (connectionId) {
        const body: Record<string, unknown> = {
          ...extra,
        };
        if (values.label?.trim()) body.label = values.label.trim();
        if (rotating) {
          body.withdrawal_permission_ack = true;
          Object.assign(body, factors);
          if (values.api_key?.trim()) body.api_key = values.api_key.trim();
          if (values.api_secret?.trim()) body.api_secret = values.api_secret.trim();
          if (values.credential_passphrase?.trim()) {
            body.passphrase = values.credential_passphrase.trim();
          }
        }
        await updateMut.mutateAsync({
          id: connectionId,
          body: body as ExchangeUpdateBody,
        });
      }
      onClose();
    } catch (e) {
      if (mergeServerFieldErrors(e, form.setError)) return;
      form.setError("root", {
        message: friendlySettingsError(e),
      });
    }
  }

  if (!open) return null;

  const pending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exchange-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl"
      >
        <h2 id="exchange-modal-title" className="text-lg font-semibold text-card-foreground">
          {mode === "create" ? "Connect" : "Update"} {exchangeTitle}
        </h2>
        <p className="mt-2 text-sm font-medium text-amber-900 dark:text-amber-100/95">{SECURITY_WARNING}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Strongly recommended: create read-only keys and never enable withdrawal permissions.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-3">
          {form.formState.errors.root?.message ? (
            <InlineAlert tone="error">{form.formState.errors.root.message}</InlineAlert>
          ) : null}

          <FormField id="ex-label" label="Label (optional)" error={form.formState.errors.label?.message}>
            <input
              id="ex-label"
              className="w-full rounded-md border border-input bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              type="text"
              autoComplete="off"
              {...form.register("label")}
            />
          </FormField>

          <FormField id="ex-key" label="API key" error={form.formState.errors.api_key?.message}>
            <input
              id="ex-key"
              className="w-full rounded-md border border-input bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              type="password"
              autoComplete="off"
              {...form.register("api_key")}
            />
          </FormField>

          <FormField id="ex-secret" label="API secret" error={form.formState.errors.api_secret?.message}>
            <input
              id="ex-secret"
              className="w-full rounded-md border border-input bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              type="password"
              autoComplete="off"
              {...form.register("api_secret")}
            />
          </FormField>

          <FormField
            id="ex-pass"
            label={
              exchange === "coinbase"
                ? "Coinbase API passphrase (if your key type requires it)"
                : "Exchange passphrase (optional)"
            }
            error={form.formState.errors.credential_passphrase?.message}
          >
            <input
              id="ex-pass"
              className="w-full rounded-md border border-input bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              type="password"
              autoComplete="off"
              {...form.register("credential_passphrase")}
            />
          </FormField>

          <div className="rounded-md border border-surface-border bg-surface-raised/50 p-3">
            <p className="text-xs font-medium text-foreground">Verify your identity (required when saving credentials)</p>
            <FormField
              id="ex-vp"
              label="Current password"
              error={form.formState.errors.verify_password?.message}
            >
              <input
                id="ex-vp"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                type="password"
                autoComplete="current-password"
                {...form.register("verify_password")}
              />
            </FormField>
            <FormField
              id="ex-vph"
              label="Security passphrase"
              error={form.formState.errors.verify_passphrase?.message}
            >
              <input
                id="ex-vph"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                type="password"
                autoComplete="off"
                {...form.register("verify_passphrase")}
              />
            </FormField>
            <FormField id="ex-vo" label="Authenticator code" error={form.formState.errors.verify_otp?.message}>
              <input
                id="ex-vo"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                inputMode="numeric"
                autoComplete="one-time-code"
                {...form.register("verify_otp")}
              />
            </FormField>
          </div>

          <label className="flex items-start gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-1 rounded border-surface-border"
              {...form.register("withdrawal_permission_ack")}
            />
            <span>I understand that withdrawal permissions should not be enabled.</span>
          </label>
          {form.formState.errors.withdrawal_permission_ack?.message ? (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.withdrawal_permission_ack.message}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <SubmitButton pending={pending}>{mode === "create" ? "Connect" : "Save"}</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
