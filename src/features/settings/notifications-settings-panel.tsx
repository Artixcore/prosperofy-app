"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { useUpdateSettingsMutation } from "@/features/app/use-settings";
import type { AppSettingsOverviewData } from "@/lib/api/types";

const notificationsSchema = z.object({
  notifications_email: z.boolean(),
  notifications_push: z.boolean(),
  notifications_marketing: z.boolean(),
});

type NotificationsValues = z.infer<typeof notificationsSchema>;

export function NotificationsSettingsPanel({ data }: { data: AppSettingsOverviewData }) {
  const updateSettings = useUpdateSettingsMutation();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const form = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      notifications_email: Boolean(data.settings.notifications?.email),
      notifications_push: Boolean(data.settings.notifications?.push),
      notifications_marketing: Boolean(data.settings.notifications?.marketing),
    },
  });

  useEffect(() => {
    form.reset({
      notifications_email: Boolean(data.settings.notifications?.email),
      notifications_push: Boolean(data.settings.notifications?.push),
      notifications_marketing: Boolean(data.settings.notifications?.marketing),
    });
  }, [data.settings, form]);

  async function onSave(values: NotificationsValues) {
    setBanner(null);
    try {
      await updateSettings.mutateAsync({
        notifications: {
          email: values.notifications_email,
          push: values.notifications_push,
          marketing: values.notifications_marketing,
        },
      });
      setBanner({ tone: "success", message: "Notification preferences saved." });
    } catch (error) {
      if (mergeServerFieldErrors(error, form.setError)) return;
      setBanner({ tone: "error", message: friendlySettingsError(error) });
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how you receive important updates.
      </p>
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      <form onSubmit={form.handleSubmit(onSave)} className="mt-4 max-w-xl space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="rounded border-surface-border" {...form.register("notifications_email")} />
            Email notifications
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="rounded border-surface-border" {...form.register("notifications_push")} />
            Push notifications
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="rounded border-surface-border" {...form.register("notifications_marketing")} />
            Product updates and tips
          </label>
        </div>
        <SubmitButton pending={updateSettings.isPending}>Save changes</SubmitButton>
      </form>
    </div>
  );
}
