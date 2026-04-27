"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { FormField } from "@/components/system/form-field";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { isApiClientError } from "@/lib/api/errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/features/app/use-settings";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string().min(1).max(64),
  notifications_email: z.boolean(),
  notifications_push: z.boolean(),
  notifications_marketing: z.boolean(),
  risk_preference: z.enum(["low", "medium", "high"]),
  default_currency: z.string().length(3),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const settings = useSettingsQuery();
  const updateSettings = useUpdateSettingsMutation();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
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

  useEffect(() => {
    const server = settings.data?.settings;
    if (!server) return;
    form.reset({
      theme: server.theme ?? "system",
      timezone: server.timezone ?? "UTC",
      notifications_email: Boolean(server.notifications?.email),
      notifications_push: Boolean(server.notifications?.push),
      notifications_marketing: Boolean(server.notifications?.marketing),
      risk_preference: server.risk_preference ?? "medium",
      default_currency: (server.default_currency ?? "USD").toUpperCase(),
    });
  }, [settings.data, form]);

  async function onSubmit(values: SettingsValues) {
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
      setBanner({ tone: "success", message: "Settings saved." });
    } catch (error) {
      if (mergeServerFieldErrors(error, form.setError)) return;
      setBanner({
        tone: "error",
        message: isApiClientError(error) ? error.message : "Failed to save settings.",
      });
    }
  }

  if (settings.isPending && settings.fetchStatus === "fetching") {
    return <LoadingState label="Loading settings…" />;
  }

  if (settings.isError || !settings.data) {
    return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences synced with Laravel."
      />
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <FormField id="theme" label="Theme" error={form.formState.errors.theme?.message}>
          <select
            id="theme"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("theme")}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </FormField>
        <FormField id="timezone" label="Timezone" error={form.formState.errors.timezone?.message}>
          <input
            id="timezone"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("timezone")}
          />
        </FormField>
        <FormField
          id="default_currency"
          label="Default currency"
          error={form.formState.errors.default_currency?.message}
        >
          <input
            id="default_currency"
            maxLength={3}
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm uppercase text-white"
            {...form.register("default_currency")}
          />
        </FormField>
        <FormField
          id="risk_preference"
          label="Risk preference"
          error={form.formState.errors.risk_preference?.message}
        >
          <select
            id="risk_preference"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white"
            {...form.register("risk_preference")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </FormField>
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-300">Notifications</p>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-surface-border"
              {...form.register("notifications_email")}
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-surface-border"
              {...form.register("notifications_push")}
            />
            Push
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-surface-border"
              {...form.register("notifications_marketing")}
            />
            Marketing
          </label>
        </div>
        <SubmitButton pending={updateSettings.isPending}>Save preferences</SubmitButton>
      </form>
    </>
  );
}
