"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/system/form-field";
import { SubmitButton } from "@/components/system/submit-button";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import {
  useCreateStrategyMutation,
  useStrategiesQuery,
  useUpdateStrategyMutation,
} from "@/features/app/use-strategies";
import type { StrategyRecord } from "@/lib/api/types";

const createSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(2000).optional(),
  marketType: z.enum(["crypto", "forex", "stock", "futures"]),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w"]),
  symbol: z.string().min(1).max(64),
});

const TF = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"] as const;

function normalizeMarketType(
  value: string,
): "crypto" | "forex" | "stock" | "futures" | undefined {
  if (value === "crypto" || value === "forex" || value === "stock" || value === "futures") {
    return value;
  }
  return undefined;
}

export default function StrategyPage() {
  const createMut = useCreateStrategyMutation();
  const [listPage, setListPage] = useState(1);
  const strategies = useStrategiesQuery({ page: listPage, perPage: 10 });
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyRecord | null>(null);
  const strategyUpdateMut = useUpdateStrategyMutation(selectedStrategy?.id ?? "");

  const [err, setErr] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "My strategy",
      description: "",
      marketType: "crypto",
      timeframe: "1d",
      symbol: "BTCUSDT",
    },
  });

  return (
    <>
      <PageHeader
        title="Strategies"
        description="Save and manage your trading strategy definitions."
      />
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      {saveBanner ? <InlineAlert tone="info">{saveBanner}</InlineAlert> : null}

      <form
        onSubmit={createForm.handleSubmit(async (values) => {
          setErr(null);
          try {
            await createMut.mutateAsync({
              name: values.name,
              description: values.description || null,
              market_type: values.marketType,
              timeframe: values.timeframe,
              source: "user",
              definition: { symbol: values.symbol },
            });
            setSaveBanner("Strategy saved.");
            createForm.reset({
              name: "My strategy",
              description: "",
              marketType: "crypto",
              timeframe: "1d",
              symbol: "BTCUSDT",
            });
            await strategies.refetch();
          } catch (error) {
            setErr(normalizeApiError(error));
          }
        })}
        className="mt-6 max-w-xl space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Create strategy</h2>
        <FormField id="name" label="Name" error={createForm.formState.errors.name?.message}>
          <input
            id="name"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...createForm.register("name")}
          />
        </FormField>
        <FormField id="description" label="Description" error={createForm.formState.errors.description?.message}>
          <textarea
            id="description"
            rows={2}
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...createForm.register("description")}
          />
        </FormField>
        <FormField id="marketType" label="Market type" error={createForm.formState.errors.marketType?.message}>
          <select
            id="marketType"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...createForm.register("marketType")}
          >
            <option value="crypto">Crypto</option>
            <option value="forex">Forex</option>
            <option value="stock">Stock</option>
            <option value="futures">Futures</option>
          </select>
        </FormField>
        <FormField id="timeframe" label="Timeframe" error={createForm.formState.errors.timeframe?.message}>
          <select
            id="timeframe"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...createForm.register("timeframe")}
          >
            {TF.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="symbol" label="Symbol" error={createForm.formState.errors.symbol?.message}>
          <input
            id="symbol"
            className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            {...createForm.register("symbol")}
          />
        </FormField>
        <SubmitButton pending={createMut.isPending}>Save strategy</SubmitButton>
      </form>

      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Saved strategies</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-sm text-secondary-foreground disabled:opacity-50"
              disabled={listPage <= 1}
              onClick={() => setListPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-sm text-secondary-foreground"
              onClick={() => setListPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
        {strategies.isPending && strategies.fetchStatus === "fetching" ? (
          <p className="text-sm text-muted-foreground">Loading saved strategies…</p>
        ) : strategies.isError ? (
          <InlineAlert tone="error">{normalizeApiError(strategies.error)}</InlineAlert>
        ) : (strategies.data?.items?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No saved strategies yet.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {strategies.data?.items.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                className={`rounded-lg border p-4 text-left ${
                  selectedStrategy?.id === strategy.id
                    ? "border-accent bg-surface-raised"
                    : "border-surface-border bg-surface-raised/40"
                }`}
                onClick={() => setSelectedStrategy(strategy)}
              >
                <p className="text-sm font-medium text-foreground">{strategy.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {strategy.market_type} • {strategy.timeframe} • {strategy.source}
                </p>
                {strategy.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{strategy.description}</p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedStrategy ? (
        <section className="mt-8 space-y-4 rounded-lg border border-surface-border bg-surface-raised/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">Selected strategy</h3>
          <FormField id="selected_name" label="Name">
            <input
              id="selected_name"
              value={selectedStrategy.name}
              onChange={(event) =>
                setSelectedStrategy((current) =>
                  current ? { ...current, name: event.target.value } : current,
                )
              }
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            />
          </FormField>
          <FormField id="selected_description" label="Description">
            <textarea
              id="selected_description"
              rows={2}
              value={selectedStrategy.description ?? ""}
              onChange={(event) =>
                setSelectedStrategy((current) =>
                  current ? { ...current, description: event.target.value } : current,
                )
              }
              className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-foreground"
            />
          </FormField>
          <button
            type="button"
            disabled={strategyUpdateMut.isPending}
            onClick={async () => {
              try {
                const marketType = normalizeMarketType(selectedStrategy.market_type);
                await strategyUpdateMut.mutateAsync({
                  name: selectedStrategy.name,
                  description: selectedStrategy.description ?? null,
                  market_type: marketType,
                  timeframe: selectedStrategy.timeframe,
                  definition: selectedStrategy.definition,
                });
                setSaveBanner("Strategy updated.");
                await strategies.refetch();
              } catch (error) {
                setSaveBanner(normalizeApiError(error));
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {strategyUpdateMut.isPending ? "Please wait…" : "Update strategy"}
          </button>
        </section>
      ) : null}
    </>
  );
}
