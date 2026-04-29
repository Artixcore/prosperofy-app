"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { mergeServerFieldErrors } from "@/lib/validation/merge-server-errors";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { LoadingState } from "@/components/system/loading-state";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { device_name: "prosperofy-app" },
  });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      await laravelFetch<Record<string, never>>(API.auth.csrfCookie);
      const payload = await laravelFetch<AuthSuccessPayload>(API.auth.login, {
        method: "POST",
        body: data,
      });
      login(payload);
      router.replace(next.startsWith("/") ? next : "/dashboard");
    } catch (e) {
      logAuthFormErrorInDevelopment(e);
      if (!mergeServerFieldErrors(e, setError)) {
        setFormError(
          resolveAuthFormCatchMessage(e, "Sign-in failed. Please try again."),
        );
      }
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-8 shadow-lg">
      <h1 className="text-xl font-semibold text-white">Sign in</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Use your Prosperofy account. API: Laravel core only.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError ? (
          <InlineAlert tone="error">{formError}</InlineAlert>
        ) : null}
        <FormField id="email" label="Email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white outline-none ring-accent focus:border-accent focus:ring-1"
            {...register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white outline-none ring-accent focus:border-accent focus:ring-1"
            {...register("password")}
          />
        </FormField>
        <input type="hidden" {...register("device_name")} />
        <SubmitButton pending={isSubmitting}>Sign in</SubmitButton>
        <p className="text-right text-xs">
          <Link href="/forgot-password" className="text-accent-muted hover:underline">
            Forgot password?
          </Link>
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/register" className="text-accent-muted hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <LoginForm />
    </Suspense>
  );
}
