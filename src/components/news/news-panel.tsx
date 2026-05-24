"use client";

import { NewsFreshnessBadge } from "@/components/news/news-freshness-badge";
import { InlineAlert } from "@/components/system/inline-alert";
import { normalizeApiError, normalizeNewsPanelError, type NewsPanelKind } from "@/lib/api/normalize-api-error";
import type { NormalizedNewsArticle } from "@/types/news";

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

function NewsRow({ article }: { article: NormalizedNewsArticle }) {
  const summary = article.summary ?? article.description;
  return (
    <li className="rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{article.source_name ?? "News"}</span>
        {article.sentiment ? (
          <span className="capitalize">{article.sentiment}</span>
        ) : null}
        {article.published_at ? <time dateTime={article.published_at}>{article.published_at}</time> : null}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{stripHtml(article.title)}</p>
      {summary ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{stripHtml(summary)}</p>
      ) : null}
      {article.url ? (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
        >
          Read source
        </a>
      ) : null}
    </li>
  );
}

type Props = {
  title: string;
  articles: NormalizedNewsArticle[];
  freshness?: string | null;
  isLoading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  panel?: NewsPanelKind;
};

export function NewsPanel({
  title,
  articles,
  freshness,
  isLoading,
  error,
  emptyMessage = "No relevant news found.",
  panel,
}: Props) {
  const err = error
    ? panel
      ? normalizeNewsPanelError(panel, error)
      : normalizeApiError(error)
    : null;

  return (
    <section className="rounded-xl border border-border/70 bg-card/30 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <NewsFreshnessBadge freshness={freshness} />
      </div>
      {err ? <InlineAlert tone="error">{err}</InlineAlert> : null}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : null}
      {!isLoading && !err && articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}
      {!isLoading && articles.length > 0 ? (
        <ul className="space-y-2">
          {articles.map((a) => (
            <NewsRow key={a.article_id} article={a} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
