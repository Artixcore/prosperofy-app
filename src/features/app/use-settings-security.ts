"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { laravelFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ExchangeProviderId, UserProfile } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session-context";

export type IdentityFactors = {
  current_password?: string;
  /** Account security passphrase (not exchange API passphrase). */
  account_passphrase?: string;
  otp?: string;
};

export function usePatchSettingsProfileMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name?: string;
      email?: string;
      avatar_url?: string | null;
    } & IdentityFactors) =>
      laravelFetch<{ profile: UserProfile }>(API.app.settingsProfile, {
        method: "PATCH",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      qc.invalidateQueries({ queryKey: ["app-profile"] });
      qc.invalidateQueries({ queryKey: ["app-dashboard"] });
    },
  });
}

export function usePatchSettingsPasswordMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { current_password: string; password: string; password_confirmation: string }) =>
      laravelFetch<Record<string, never>>(API.app.settingsPassword, {
        method: "PATCH",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function usePostSecurityPassphraseMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      current_password: string;
      passphrase: string;
      passphrase_confirmation: string;
      recovery_hint?: string | null;
    }) =>
      laravelFetch<Record<string, never>>(API.app.settingsPassphrase, {
        method: "POST",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useTwoFactorSetupMutation() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: () =>
      laravelFetch<{ provisioning_uri: string }>(API.app.settingsTwoFactorSetup, {
        method: "POST",
        body: {},
        token,
      }),
  });
}

export function useTwoFactorConfirmMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { otp: string }) =>
      laravelFetch<{ recovery_codes: string[] }>(API.app.settingsTwoFactorConfirm, {
        method: "POST",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useTwoFactorDisableMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IdentityFactors) =>
      laravelFetch<Record<string, never>>(API.app.settingsTwoFactorDisable, {
        method: "POST",
        body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export type ExchangeStoreBody = {
  exchange: ExchangeProviderId;
  label?: string | null;
  api_key: string;
  api_secret: string;
  passphrase?: string | null;
  extra?: { account_type?: "unified" | "spot" | "derivatives" };
  withdrawal_permission_ack: boolean;
} & IdentityFactors;

export type ExchangeUpdateBody = {
  label?: string | null;
  api_key?: string;
  api_secret?: string;
  passphrase?: string | null;
  extra?: { account_type?: "unified" | "spot" | "derivatives" };
  withdrawal_permission_ack?: boolean;
} & IdentityFactors;

export function useCreateExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ExchangeStoreBody) =>
      laravelFetch<{ connection: Record<string, unknown>; verified?: boolean }>(
        API.app.settingsExchanges,
        {
          method: "POST",
          body,
          token,
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useUpdateExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: ExchangeUpdateBody }) =>
      laravelFetch<{ connection: Record<string, unknown>; verified?: boolean }>(
        API.app.settingsExchange(args.id),
        {
          method: "PATCH",
          body: args.body,
          token,
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useTestExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      laravelFetch<{ connection: Record<string, unknown>; verified: boolean }>(
        API.app.settingsExchangeTest(id),
        {
          method: "POST",
          body: {},
          token,
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}

export function useDeleteExchangeConnectionMutation() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: IdentityFactors }) =>
      laravelFetch<Record<string, never>>(API.app.settingsExchange(args.id), {
        method: "DELETE",
        body: args.body,
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
    },
  });
}
