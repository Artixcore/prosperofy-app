"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { FormField } from "@/components/system/form-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { useUpdateSettingsMutation } from "@/features/app/use-settings";
import { useTheme } from "@/lib/theme/theme-context";
import type { AppSettingsOverviewData } from "@/lib/api/types";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string().min(1).max(64),
  risk_preference: z.enum(["low", "medium", "high"]),
  default_currency: z.string().length(3),
});

type PreferencesValues = z.infer<typeof preferencesSchema>;

export function PreferencesSettingsPanel({ data }: { data: AppSettingsOverviewData }) {
  const { setTheme } = useTheme();
  const updateSettings = useUpdateSettingsMutation();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: data.settings.theme ?? "system",
      timezone: data.settings.timezone ?? "UTC",
      risk_preference: data.settings.risk_preference ?? "medium",
      default_currency: (data.settings.default_currency ?? "USD").toUpperCase(),
    },
  });

  useEffect(() => {
    form.reset({
      theme: data.settings.theme ?? "system",
      timezone: data.settings.timezone ?? "UTC",
      risk_preference: data.settings.risk_preference ?? "medium",
      default_currency: (data.settings.default_currency ?? "USD").toUpperCase(),
    });
  }, [data.settings, form]);

  async function onSave(values: PreferencesValues) {
    setBanner(null);
    try {
      await updateSettings.mutateAsync({
        theme: values.theme,
        timezone: values.timezone,
        risk_preference: values.risk_preference,
        default_currency: values.default_currency.toUpperCase(),
      });
      setTheme(values.theme);
      setBanner({ tone: "success", message: "Preferences saved." });
    } catch (error) {
      if (mergeServerFieldErrors(error, form.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(error) });
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">Preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">Customize your dashboard experience.</p>
      <div className="mt-3">
        <ThemeToggle />
      </div>
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      <form onSubmit={form.handleSubmit(onSave)} className="mt-4 max-w-xl space-y-4">
        <FormField id="theme" label="Theme" error={form.formState.errors.theme?.message}>
          <select
            id="theme"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
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
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
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
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm uppercase text-foreground"
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
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...form.register("risk_preference")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </FormField>
        <SubmitButton pending={updateSettings.isPending}>Save changes</SubmitButton>
      </form>
    </div>
  );
}
