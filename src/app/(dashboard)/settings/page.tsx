"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { FormField } from "@/components/system/form-field";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExchangeCredentialsModal } from "@/components/settings/exchange-credentials-modal";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/features/app/use-settings";
import { useTheme } from "@/lib/theme/theme-context";
import type { ExchangeConnectionSummary, ExchangeProviderId } from "@/lib/api/types";
import {
  useDeleteExchangeConnectionMutation,
  usePatchSettingsPasswordMutation,
  usePatchSettingsProfileMutation,
  usePostSecurityPassphraseMutation,
  useTestExchangeConnectionMutation,
  useTwoFactorConfirmMutation,
  useTwoFactorDisableMutation,
  useTwoFactorSetupMutation,
} from "@/features/app/use-settings-security";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string().min(1).max(64),
  notifications_email: z.boolean(),
  notifications_push: z.boolean(),
  notifications_marketing: z.boolean(),
  risk_preference: z.enum(["low", "medium", "high"]),
  default_currency: z.string().length(3),
});

type PreferencesValues = z.infer<typeof preferencesSchema>;

const profileSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  verify_password: z.string().optional(),
  verify_passphrase: z.string().optional(),
  verify_otp: z.string().optional(),
});

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

function exchangeLabel(id: string): string {
  if (id === "binance") return "Binance";
  if (id === "coinbase") return "Coinbase";
  return "Bybit";
}

function statusLabel(row: ExchangeConnectionSummary): string {
  switch (row.status) {
    case "not_connected":
      return "Not connected";
    case "connected":
      return "Connected";
    case "verification_failed":
      return "Verification failed";
    case "disabled":
      return "Disabled";
    case "revoked":
      return "Revoked";
    default:
      return row.status;
  }
}

function permissionSummary(row: ExchangeConnectionSummary): string {
  const p = row.permissions as Record<string, unknown> | null | undefined;
  if (!p || typeof p !== "object") return "Unknown";
  const w = p.withdrawals_enabled;
  const t = p.trading_enabled;
  const mode = p.mode;
  if (w === true) return "Withdrawals enabled";
  if (t === true) return "Trading enabled";
  if (mode === "read_only" || p.raw_capabilities === undefined) return "Read-only";
  return "Unknown";
}

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const settings = useSettingsQuery();
  const updateSettings = useUpdateSettingsMutation();
  const patchProfile = usePatchSettingsProfileMutation();
  const patchPassword = usePatchSettingsPasswordMutation();
  const postPassphrase = usePostSecurityPassphraseMutation();
  const tfSetup = useTwoFactorSetupMutation();
  const tfConfirm = useTwoFactorConfirmMutation();
  const tfDisable = useTwoFactorDisableMutation();
  const testExchange = useTestExchangeConnectionMutation();
  const deleteExchange = useDeleteExchangeConnectionMutation();

  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const [exchangeModal, setExchangeModal] = useState<{
    exchange: ExchangeProviderId;
    mode: "create" | "update";
    connectionId: string | null;
  } | null>(null);

  const [disconnect, setDisconnect] = useState<{ id: string; exchange: ExchangeProviderId } | null>(null);
  const disconnectForm = useForm({
    defaultValues: { verify_password: "", verify_passphrase: "", verify_otp: "" },
  });

  const [tfUri, setTfUri] = useState<string | null>(null);
  const [tfCodes, setTfCodes] = useState<string[] | null>(null);
  const tfOtpForm = useForm({ defaultValues: { otp: "" } });
  const tfDisableForm = useForm({
    defaultValues: { verify_password: "", verify_passphrase: "", verify_otp: "" },
  });

  const prefsForm = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: "system",
      timezone: "UTC",
      notifications_email: false,
      notifications_push: false,
      notifications_marketing: false,
      risk_preference: "medium",
      default_currency: "USD",
    },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
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

  useEffect(() => {
    const server = settings.data?.settings;
    if (!server) return;
    prefsForm.reset({
      theme: server.theme ?? "system",
      timezone: server.timezone ?? "UTC",
      notifications_email: Boolean(server.notifications?.email),
      notifications_push: Boolean(server.notifications?.push),
      notifications_marketing: Boolean(server.notifications?.marketing),
      risk_preference: server.risk_preference ?? "medium",
      default_currency: (server.default_currency ?? "USD").toUpperCase(),
    });
  }, [settings.data, prefsForm]);

  useEffect(() => {
    const p = settings.data?.profile;
    if (!p) return;
    profileForm.reset({
      name: p.name,
      email: p.email,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    });
  }, [settings.data, profileForm]);

  async function onPreferences(values: PreferencesValues) {
    setBanner(null);
    try {
      await updateSettings.mutateAsync({
        theme: values.theme,
        timezone: values.timezone,
        notifications: {
          email: values.notifications_email,
          push: values.notifications_push,
          marketing: values.notifications_marketing,
        },
        risk_preference: values.risk_preference,
        default_currency: values.default_currency.toUpperCase(),
      });
      setTheme(values.theme);
      setBanner({ tone: "success", message: "Settings saved." });
    } catch (error) {
      if (mergeServerFieldErrors(error, prefsForm.setError)) return;
      setBanner({
        tone: "error",
        message: friendlySettingsError(error),
      });
    }
  }

  async function onProfileSave(values: z.infer<typeof profileSchema>) {
    setBanner(null);
    try {
      const originalEmail = settings.data?.profile.email ?? "";
      const emailChanging =
        values.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();
      if (emailChanging) {
        const ok =
          (values.verify_password?.trim().length ?? 0) > 0 ||
          (values.verify_passphrase?.trim().length ?? 0) > 0 ||
          (values.verify_otp?.trim().length ?? 0) > 0;
        if (!ok) {
          profileForm.setError("verify_password", {
            message:
              "Changing email requires your password, security passphrase, or an authenticator code.",
          });
          return;
        }
      }

      await patchProfile.mutateAsync({
        name: values.name,
        email: values.email,
        current_password: values.verify_password?.trim() || undefined,
        account_passphrase: values.verify_passphrase?.trim() || undefined,
        otp: values.verify_otp?.trim() || undefined,
      });
      setBanner({ tone: "success", message: "Your profile was updated successfully." });
    } catch (error) {
      if (mergeServerFieldErrors(error, profileForm.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(error) });
    }
  }

  async function onPassword(values: z.infer<typeof passwordSchema>) {
    setBanner(null);
    try {
      await patchPassword.mutateAsync(values);
      passwordForm.reset({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
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

  if (settings.isPending && settings.fetchStatus === "fetching") {
    return <LoadingState label="Loading settings…" />;
  }

  if (settings.isError || !settings.data) {
    return (
      <ErrorState
        error={settings.error}
        title="Settings could not be loaded. Please try again shortly."
        onRetry={() => void settings.refetch()}
      />
    );
  }

  const sec = settings.data.security;
  const exchanges = settings.data.exchanges;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, security, exchange APIs, and preferences — synced securely with Prosperofy."
      />
      <div className="mt-3">
        <ThemeToggle />
      </div>
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your name and email (email changes require verification).</p>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSave)}
            className="mt-4 max-w-xl space-y-3 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
          >
            <FormField id="p-name" label="Name" error={profileForm.formState.errors.name?.message}>
              <input
                id="p-name"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...profileForm.register("name")}
              />
            </FormField>
            <FormField id="p-email" label="Email" error={profileForm.formState.errors.email?.message}>
              <input
                id="p-email"
                type="email"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...profileForm.register("email")}
              />
            </FormField>
            <div className="rounded-md border border-surface-border bg-surface/60 p-3">
              <p className="text-xs text-muted-foreground">
                If you change your email, verify with one of the following:
              </p>
              <input
                type="password"
                placeholder="Current password"
                className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                autoComplete="current-password"
                {...profileForm.register("verify_password")}
              />
              {profileForm.formState.errors.verify_password?.message ? (
                <p className="mt-1 text-xs text-destructive">{profileForm.formState.errors.verify_password.message}</p>
              ) : null}
              <input
                type="password"
                placeholder="Security passphrase"
                className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...profileForm.register("verify_passphrase")}
              />
              <input
                placeholder="Authenticator code"
                className="mt-2 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...profileForm.register("verify_otp")}
              />
            </div>
            <SubmitButton pending={patchProfile.isPending}>Save profile</SubmitButton>
          </form>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Change password</h2>
          <form
            onSubmit={passwordForm.handleSubmit(onPassword)}
            className="mt-4 max-w-xl space-y-3 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
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
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...passwordForm.register("current_password")}
              />
            </FormField>
            <FormField id="pw-n" label="New password" error={passwordForm.formState.errors.password?.message}>
              <input
                id="pw-n"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
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
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...passwordForm.register("password_confirmation")}
              />
            </FormField>
            <SubmitButton pending={patchPassword.isPending}>Change password</SubmitButton>
          </form>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Security</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-surface-border bg-surface-raised/40 p-5">
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
                      <p className="mt-2 break-all text-[11px] leading-snug text-muted-foreground">{tfUri}</p>
                      <form
                        className="mt-3 flex flex-col gap-2"
                        onSubmit={tfOtpForm.handleSubmit(async (v) => {
                          try {
                            const out = await tfConfirm.mutateAsync({ otp: v.otp });
                            setTfCodes(out.recovery_codes);
                            setTfUri(null);
                            tfOtpForm.reset();
                            setBanner({
                              tone: "success",
                              message: "Two-factor authentication is enabled.",
                            });
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
                          className="rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                          inputMode="numeric"
                          {...tfOtpForm.register("otp")}
                        />
                        {tfOtpForm.formState.errors.otp?.message ? (
                          <p className="text-xs text-destructive">{tfOtpForm.formState.errors.otp.message}</p>
                        ) : null}
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
                  <p className="text-xs text-muted-foreground">Disable requires password, passphrase, or authenticator code.</p>
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    {...tfDisableForm.register("verify_password")}
                  />
                  <input
                    type="password"
                    placeholder="Security passphrase"
                    className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    {...tfDisableForm.register("verify_passphrase")}
                  />
                  <input
                    placeholder="Authenticator code"
                    className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
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

            <div className="rounded-lg border border-surface-border bg-surface-raised/40 p-5">
              <h3 className="text-sm font-medium text-foreground">Security passphrase</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Status:{" "}
                <span className="text-foreground">{sec.passphrase_set ? "Set" : "Not set"}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Used to verify sensitive actions such as exchange API changes.
              </p>
              <form
                className="mt-3 space-y-2"
                onSubmit={passphraseForm.handleSubmit(onPassphrase)}
              >
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  autoComplete="current-password"
                  {...passphraseForm.register("current_password")}
                />
                {passphraseForm.formState.errors.current_password?.message ? (
                  <p className="text-xs text-destructive">{passphraseForm.formState.errors.current_password.message}</p>
                ) : null}
                <input
                  type="password"
                  placeholder="New passphrase (min 12 chars)"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  {...passphraseForm.register("passphrase")}
                />
                <input
                  type="password"
                  placeholder="Confirm passphrase"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  {...passphraseForm.register("passphrase_confirmation")}
                />
                <input
                  type="text"
                  placeholder="Recovery hint (optional)"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  {...passphraseForm.register("recovery_hint")}
                />
                <SubmitButton pending={postPassphrase.isPending}>
                  {sec.passphrase_set ? "Change passphrase" : "Add passphrase"}
                </SubmitButton>
              </form>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Email verified: {sec.email_verified ? "Yes" : "No"} — use a verified inbox for security alerts.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Exchange APIs</h2>
          <InlineAlert tone="warning">
            For your safety, use read-only API keys and never enable withdrawal permissions.
          </InlineAlert>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {exchanges.map((row) => {
              const ex = row.exchange as ExchangeProviderId;
              const cid = row.id ?? null;
              const connected = row.status !== "not_connected" && cid;

              return (
                <div
                  key={row.exchange}
                  className="rounded-lg border border-surface-border bg-surface-raised/40 p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">{exchangeLabel(row.exchange)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Connection: {statusLabel(row)}</p>
                  {row.key_display_suffix ? (
                    <p className="mt-1 text-xs text-muted-foreground">Key ending ····{row.key_display_suffix}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Permissions: {permissionSummary(row)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last verified:{" "}
                    {row.last_verified_at
                      ? new Date(row.last_verified_at).toLocaleString()
                      : "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!connected ? (
                      <button
                        type="button"
                        className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                        onClick={() =>
                          setExchangeModal({ exchange: ex, mode: "create", connectionId: null })
                        }
                      >
                        Connect
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="rounded-md border border-border px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                          onClick={async () => {
                            setBanner(null);
                            try {
                              await testExchange.mutateAsync(cid);
                              setBanner({
                                tone: "success",
                                message: "Exchange API credentials verified.",
                              });
                            } catch (e) {
                              setBanner({ tone: "error", message: friendlySettingsError(e) });
                            }
                          }}
                        >
                          Test connection
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-border px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                          onClick={() =>
                            setExchangeModal({ exchange: ex, mode: "update", connectionId: cid })
                          }
                        >
                          Update credentials
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50 dark:border-red-900/50 dark:text-red-200 dark:hover:bg-red-950/40"
                          onClick={() => setDisconnect({ id: cid, exchange: ex })}
                        >
                          Disconnect
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Preferences</h2>
          <form
            onSubmit={prefsForm.handleSubmit(onPreferences)}
            className="mt-4 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
          >
            <FormField id="theme" label="Theme" error={prefsForm.formState.errors.theme?.message}>
              <select
                id="theme"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...prefsForm.register("theme")}
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </FormField>
            <FormField id="timezone" label="Timezone" error={prefsForm.formState.errors.timezone?.message}>
              <input
                id="timezone"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...prefsForm.register("timezone")}
              />
            </FormField>
            <FormField
              id="default_currency"
              label="Default currency"
              error={prefsForm.formState.errors.default_currency?.message}
            >
              <input
                id="default_currency"
                maxLength={3}
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm uppercase text-foreground placeholder:text-muted-foreground"
                {...prefsForm.register("default_currency")}
              />
            </FormField>
            <FormField
              id="risk_preference"
              label="Risk preference"
              error={prefsForm.formState.errors.risk_preference?.message}
            >
              <select
                id="risk_preference"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...prefsForm.register("risk_preference")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Notifications</p>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...prefsForm.register("notifications_email")}
                />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...prefsForm.register("notifications_push")}
                />
                Push
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="rounded border-surface-border"
                  {...prefsForm.register("notifications_marketing")}
                />
                Marketing
              </label>
            </div>
            <SubmitButton pending={updateSettings.isPending}>Save preferences</SubmitButton>
          </form>
        </div>
      </section>

      {exchangeModal ? (
        <ExchangeCredentialsModal
          open
          onClose={() => setExchangeModal(null)}
          exchange={exchangeModal.exchange}
          mode={exchangeModal.mode}
          connectionId={exchangeModal.connectionId}
        />
      ) : null}

      {disconnect ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground">
            <h3 className="text-lg font-semibold text-card-foreground">Disconnect {exchangeLabel(disconnect.exchange)}?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Verify your identity to remove this connection.</p>
            <form
              className="mt-4 space-y-2"
              onSubmit={disconnectForm.handleSubmit(async (v) => {
                setBanner(null);
                try {
                  await deleteExchange.mutateAsync({
                    id: disconnect.id,
                    body: {
                      current_password: v.verify_password || undefined,
                      account_passphrase: v.verify_passphrase || undefined,
                      otp: v.verify_otp || undefined,
                    },
                  });
                  disconnectForm.reset();
                  setDisconnect(null);
                  setBanner({ tone: "success", message: "This exchange connection was removed." });
                } catch (e) {
                  setBanner({ tone: "error", message: friendlySettingsError(e) });
                }
              })}
            >
              <input
                type="password"
                placeholder="Current password"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...disconnectForm.register("verify_password")}
              />
              <input
                type="password"
                placeholder="Security passphrase"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...disconnectForm.register("verify_passphrase")}
              />
              <input
                placeholder="Authenticator code"
                className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                {...disconnectForm.register("verify_otp")}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary"
                  onClick={() => setDisconnect(null)}
                >
                  Cancel
                </button>
                <SubmitButton pending={deleteExchange.isPending}>Remove connection</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
