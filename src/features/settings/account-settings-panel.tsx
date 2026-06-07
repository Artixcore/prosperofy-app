"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineAlert } from "@/components/system/inline-alert";
import { SubmitButton } from "@/components/system/submit-button";
import { FormField } from "@/components/system/form-field";
import { friendlySettingsError } from "@/lib/api/settings-errors";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { usePatchSettingsProfileMutation } from "@/features/app/use-settings-security";
import type { AppSettingsOverviewData } from "@/lib/api/types";

const profileSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  verify_password: z.string().optional(),
  verify_passphrase: z.string().optional(),
  verify_otp: z.string().optional(),
});

export function AccountSettingsPanel({ data }: { data: AppSettingsOverviewData }) {
  const patchProfile = usePatchSettingsProfileMutation();
  const [banner, setBanner] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.profile.name,
      email: data.profile.email,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    },
  });

  useEffect(() => {
    profileForm.reset({
      name: data.profile.name,
      email: data.profile.email,
      verify_password: "",
      verify_passphrase: "",
      verify_otp: "",
    });
  }, [data.profile, profileForm]);

  async function onProfileSave(values: z.infer<typeof profileSchema>) {
    setBanner(null);
    try {
      const originalEmail = data.profile.email ?? "";
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

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your profile and account details.
      </p>
      {banner ? <InlineAlert tone={banner.tone}>{banner.message}</InlineAlert> : null}
      <form
        onSubmit={profileForm.handleSubmit(onProfileSave)}
        className="mt-4 max-w-xl space-y-3"
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
        <SubmitButton pending={patchProfile.isPending}>Save changes</SubmitButton>
      </form>
    </div>
  );
}
