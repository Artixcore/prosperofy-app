"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { ErrorState } from "@/components/system/error-state";
import { LoadingState } from "@/components/system/loading-state";
import { PageHeader } from "@/components/page-header";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { useProfileQuery, useUpdateProfileMutation } from "@/features/app/use-profile";

const schema = z.object({
  name: z.string().min(1).max(255),
  avatar_url: z
    .string()
    .url("Please provide a valid URL.")
    .max(2048)
    .or(z.literal(""))
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const profile = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(
    null,
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    if (!profile.data) return;
    form.reset({
      name: profile.data.name ?? "",
      avatar_url: profile.data.avatar_url ?? "",
    });
  }, [profile.data, form]);

  async function onSubmit(values: FormValues) {
    setBanner(null);
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        avatar_url: values.avatar_url || null,
      });
      setBanner({ tone: "success", message: "Profile updated." });
    } catch (error) {
      if (mergeServerFieldErrors(error, form.setError)) return;
      setBanner({
        tone: "error",
        message: normalizeApiError(error),
      });
    }
  }

  if (profile.isPending && profile.fetchStatus === "fetching") {
    return <LoadingState label="Loading profile…" />;
  }

  if (profile.isError || !profile.data) {
    return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account profile synced with Laravel."
      />
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}

      <form
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-muted/30 p-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField id="name" label="Name" error={form.formState.errors.name?.message}>
          <input
            id="name"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("name")}
          />
        </FormField>
        <FormField
          id="avatar_url"
          label="Avatar URL (optional)"
          error={form.formState.errors.avatar_url?.message}
        >
          <input
            id="avatar_url"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            {...form.register("avatar_url")}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-surface-border bg-surface p-3">
            <p className="text-xs uppercase text-muted-foreground">Email</p>
            <p className="mt-1 text-sm text-foreground">{profile.data.email}</p>
          </div>
          <div className="rounded-md border border-surface-border bg-surface p-3">
            <p className="text-xs uppercase text-muted-foreground">Role</p>
            <p className="mt-1 text-sm text-foreground">{profile.data.role}</p>
          </div>
        </div>
        <SubmitButton pending={updateProfile.isPending}>Save profile</SubmitButton>
      </form>
    </>
  );
}
