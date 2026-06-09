import { z } from "zod";

export const normalizedNewsArticleSchema = z.object({
  provider: z.string(),
  article_id: z.string(),
  title: z.string(),
  url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).nullable().optional(),
  published_at: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export type NormalizedNewsArticle = z.infer<typeof normalizedNewsArticleSchema>;

export const newsSearchResultSchema = z.object({
  provider: z.string(),
  endpoint: z.string().optional(),
  articles: z.array(normalizedNewsArticleSchema),
  total_results: z.number().optional(),
  data_freshness: z.enum(["live", "cached", "disabled", "unavailable", "unconfigured"]).optional(),
  fetched_at: z.string().nullable().optional(),
  notice: z.string().nullable().optional(),
});

export type NewsSearchResult = z.infer<typeof newsSearchResultSchema>;

export type NewsImpact = "positive" | "negative" | "neutral" | "mixed" | "unavailable";

export type NewsSourceRow = {
  title: string;
  source_name?: string | null;
  url?: string | null;
  published_at?: string | null;
};
