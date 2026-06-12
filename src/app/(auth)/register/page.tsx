"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { AuthSuccessPayload } from "@/lib/api/types";
import {
  logAuthFormErrorInDevelopment,
  resolveAuthFormCatchMessage,
} from "@/lib/api/auth-form-error";
import { useAuth } from "@/lib/auth/session-context";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { device_name: "prosperofy-app" },
  });

  useEffect(() => {
    const ref = searchParams.get("ref")?.trim();
    if (ref) {
      setValue("referral_code", ref);
    }
  }, [searchParams, setValue]);

  async function onSubmit(data: RegisterInput) {
    setFormError(null);
    try {
      const payload = await laravelFetch<AuthSuccessPayload>(API.auth.register, {
        method: "POST",
        body: data,
        skipCsrfRetry: true,
      });
      login(payload);
      router.replace("/dashboard");
    } catch (e) {
      logAuthFormErrorInDevelopment(e);
      if (!mergeServerFieldErrors(e, setError)) {
        setFormError(
          resolveAuthFormCatchMessage(e, "Registration failed. Please try again."),
        );
      }
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-8 shadow-lg">
      <h1 className="text-xl font-semibold text-foreground">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create your Prosperofy account to get started.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? (
          <InlineAlert tone="error">{formError}</InlineAlert>
        ) : null}
        <FormField id="name" label="Name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            {...register("name")}
          />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            {...register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            {...register("password")}
          />
        </FormField>
        <FormField
          id="password_confirmation"
          label="Confirm password"
          error={errors.password_confirmation?.message}
        >
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
            {...register("password_confirmation")}
          />
        </FormField>
        <input type="hidden" {...register("device_name")} />
        <input type="hidden" {...register("referral_code")} />
        <SubmitButton pending={isSubmitting}>Create account</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-muted hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
