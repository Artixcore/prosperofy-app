"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { FormField } from "@/components/system/form-field";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import {
  usePatchSettingsPasswordMutation,
  usePostSecurityPassphraseMutation,
  useTwoFactorConfirmMutation,
  useTwoFactorDisableMutation,
  useTwoFactorSetupMutation,
} from "@/features/app/use-settings-security";
import type { AppSettingsOverviewData } from "@/lib/api/types";

const passwordSchema = z
  .object({
    current_password: z.string().min(1),
    password: z.string().min(8),
    password_confirmation: z.string().min(1),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

const passphraseSchema = z
  .object({
    current_password: z.string().min(1),
    passphrase: z.string().min(12),
    passphrase_confirmation: z.string().min(1),
    recovery_hint: z.string().max(255).optional(),
  })
  .refine((v) => v.passphrase === v.passphrase_confirmation, {
    message: "Passphrases do not match.",
    path: ["passphrase_confirmation"],
  });

export function SecuritySettingsPanel({ data }: { data: AppSettingsOverviewData }) {
  const sec = data.security;
  const patchPassword = usePatchSettingsPasswordMutation();
  const postPassphrase = usePostSecurityPassphraseMutation();
  const tfSetup = useTwoFactorSetupMutation();
  const tfConfirm = useTwoFactorConfirmMutation();
  const tfDisable = useTwoFactorDisableMutation();

  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [tfUri, setTfUri] = useState<string | null>(null);
  const [tfCodes, setTfCodes] = useState<string[] | null>(null);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });
  const passphraseForm = useForm<z.infer<typeof passphraseSchema>>({
    resolver: zodResolver(passphraseSchema),
    defaultValues: {
      current_password: "",
      passphrase: "",
      passphrase_confirmation: "",
      recovery_hint: "",
    },
  });
  const tfOtpForm = useForm({ defaultValues: { otp: "" } });
  const tfDisableForm = useForm({
    defaultValues: { verify_password: "", verify_passphrase: "", verify_otp: "" },
  });

  async function onPassword(values: z.infer<typeof passwordSchema>) {
    setBanner(null);
    try {
      await patchPassword.mutateAsync(values);
      passwordForm.reset({ current_password: "", password: "", password_confirmation: "" });
      setBanner({ tone: "success", message: "Password changed successfully." });
    } catch (error) {
      if (mergeServerFieldErrors(error, passwordForm.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(error) });
    }
  }

  async function onPassphrase(values: z.infer<typeof passphraseSchema>) {
    setBanner(null);
    try {
      await postPassphrase.mutateAsync({
        current_password: values.current_password,
        passphrase: values.passphrase,
        passphrase_confirmation: values.passphrase_confirmation,
        recovery_hint: values.recovery_hint?.trim() || undefined,
      });
      passphraseForm.reset({
        current_password: "",
        passphrase: "",
        passphrase_confirmation: "",
        recovery_hint: "",
      });
      setBanner({ tone: "success", message: "Your security passphrase was saved." });
    } catch (error) {
      if (mergeServerFieldErrors(error, passphraseForm.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(error) });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-foreground">Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update security settings and protect your account.
        </p>
        {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground">Change password</h3>
        <form
          onSubmit={passwordForm.handleSubmit(onPassword)}
          className="mt-3 max-w-xl space-y-3"
        >
          <FormField
            id="pw-c"
            label="Current password"
            error={passwordForm.formState.errors.current_password?.message}
          >
            <input
              id="pw-c"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passwordForm.register("current_password")}
            />
          </FormField>
          <FormField id="pw-n" label="New password" error={passwordForm.formState.errors.password?.message}>
            <input
              id="pw-n"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passwordForm.register("password")}
            />
          </FormField>
          <FormField
            id="pw-nc"
            label="Confirm new password"
            error={passwordForm.formState.errors.password_confirmation?.message}
          >
            <input
              id="pw-nc"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passwordForm.register("password_confirmation")}
            />
          </FormField>
          <SubmitButton pending={patchPassword.isPending}>Change password</SubmitButton>
        </form>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 max-w-full rounded-lg border border-surface-border bg-surface-raised/40 p-5">
          <h3 className="text-sm font-medium text-foreground">Two-factor authentication</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Status:{" "}
            <span className="text-foreground">{sec.two_factor.enabled ? "Enabled" : "Disabled"}</span>
          </p>
          {!sec.two_factor.enabled ? (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                onClick={async () => {
                  setTfCodes(null);
                  setBanner(null);
                  try {
                    const r = await tfSetup.mutateAsync();
                    setTfUri(r.provisioning_uri);
                  } catch (e) {
                    setBanner({ tone: "error", message: friendlySettingsError(e) });
                  }
                }}
              >
                Set up authenticator
              </button>
              {tfUri ? (
                <div className="rounded-md border border-surface-border bg-surface p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Authenticator setup</p>
                  <p className="mt-2 break-all text-[11px] leading-snug">{tfUri}</p>
                  <form
                    className="mt-3 flex flex-col gap-2"
                    onSubmit={tfOtpForm.handleSubmit(async (v) => {
                      try {
                        const out = await tfConfirm.mutateAsync({ otp: v.otp });
                        setTfCodes(out.recovery_codes);
                        setTfUri(null);
                        tfOtpForm.reset();
                        setBanner({ tone: "success", message: "Two-factor authentication is enabled." });
                      } catch (e) {
                        if (mergeServerFieldErrors(e, tfOtpForm.setError)) return;
                        setBanner({ tone: "error", message: friendlySettingsError(e) });
                      }
                    })}
                  >
                    <label className="text-xs text-muted-foreground" htmlFor="tf-otp">
                      Enter the 6-digit code
                    </label>
                    <input
                      id="tf-otp"
                      className="rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
                      inputMode="numeric"
                      {...tfOtpForm.register("otp")}
                    />
                    <SubmitButton pending={tfConfirm.isPending}>Confirm and enable</SubmitButton>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <form
              className="mt-3 space-y-2"
              onSubmit={tfDisableForm.handleSubmit(async (v) => {
                try {
                  await tfDisable.mutateAsync({
                    current_password: v.verify_password || undefined,
                    account_passphrase: v.verify_passphrase || undefined,
                    otp: v.verify_otp || undefined,
                  });
                  tfDisableForm.reset();
                  setBanner({ tone: "success", message: "Two-factor authentication has been disabled." });
                } catch (e) {
                  setBanner({ tone: "error", message: friendlySettingsError(e) });
                }
              })}
            >
              <p className="text-xs text-muted-foreground">
                Disable requires password, passphrase, or authenticator code.
              </p>
              <input
                type="password"
                placeholder="Current password"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
                {...tfDisableForm.register("verify_password")}
              />
              <input
                type="password"
                placeholder="Security passphrase"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
                {...tfDisableForm.register("verify_passphrase")}
              />
              <input
                placeholder="Authenticator code"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
                {...tfDisableForm.register("verify_otp")}
              />
              <SubmitButton pending={tfDisable.isPending} className="bg-red-800 hover:bg-red-700">
                Disable 2FA
              </SubmitButton>
            </form>
          )}
          {tfCodes?.length ? (
            <InlineAlert tone="success">
              <p className="font-medium">Save these recovery codes once — they won&apos;t be shown again.</p>
              <ul className="mt-2 list-inside list-disc font-mono text-xs">
                {tfCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </InlineAlert>
          ) : null}
        </div>

        <div className="min-w-0 max-w-full rounded-lg border border-surface-border bg-surface-raised/40 p-5">
          <h3 className="text-sm font-medium text-foreground">Security passphrase</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Status: <span className="text-foreground">{sec.passphrase_set ? "Set" : "Not set"}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Used to verify sensitive actions such as exchange connection changes.
          </p>
          <form className="mt-3 space-y-2" onSubmit={passphraseForm.handleSubmit(onPassphrase)}>
            <input
              type="password"
              placeholder="Current password"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              autoComplete="current-password"
              {...passphraseForm.register("current_password")}
            />
            <input
              type="password"
              placeholder="New passphrase (min 12 chars)"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passphraseForm.register("passphrase")}
            />
            <input
              type="password"
              placeholder="Confirm passphrase"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passphraseForm.register("passphrase_confirmation")}
            />
            <input
              type="text"
              placeholder="Recovery hint (optional)"
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
              {...passphraseForm.register("recovery_hint")}
            />
            <SubmitButton pending={postPassphrase.isPending}>
              {sec.passphrase_set ? "Change passphrase" : "Add passphrase"}
            </SubmitButton>
          </form>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Email verified: {sec.email_verified ? "Yes" : "No"} — use a verified inbox for security alerts.
      </p>
    </div>
  );
}
