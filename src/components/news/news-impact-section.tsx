"use client";

import { NewsFreshnessBadge } from "@/components/news/news-freshness-badge";
import type { NewsImpact, NewsSourceRow } from "@/types/news";

type Props = {
  newsImpact?: NewsImpact | string | null;
  newsSources?: NewsSourceRow[];
  dataFreshness?: string | null;
};

export function NewsImpactSection({ newsImpact, newsSources, dataFreshness }: Props) {
  const impact = newsImpact ?? "unavailable";
  const sources = newsSources ?? [];

  return (
    <section className="rounded-xl border border-border/70 bg-card/30 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">News impact</h3>
        <NewsFreshnessBadge freshness={dataFreshness} />
        <span className="text-xs capitalize text-muted-foreground">{impact}</span>
      </div>
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {impact === "unavailable"
            ? "News context was unavailable for this run."
            : "No article sources attached."}
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {sources.map((s, i) => (
            <li key={`${s.title}-${i}`}>
              <span className="font-medium text-foreground">{s.title}</span>
              {s.source_name ? (
                <span className="text-muted-foreground"> — {s.source_name}</span>
              ) : null}
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:underline"
                >
                  Source
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
