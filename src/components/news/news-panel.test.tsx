import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsPanel } from "@/components/news/news-panel";

describe("NewsPanel", () => {
  it("renders empty state", () => {
    render(
      <NewsPanel title="Test news" articles={[]} freshness="live" emptyMessage="No news here." />
    );
    expect(screen.getByText("No news here.")).toBeInTheDocument();
  });

  it("does not reference newsdata.io host", () => {
    const { container } = render(
      <NewsPanel
        title="Test"
        articles={[
          {
            provider: "newsdata",
            article_id: "1",
            title: "Headline",
            url: "https://example.com/story",
            source_name: "Example",
          },
        ]}
        freshness="live"
      />
    );
    expect(container.innerHTML).not.toContain("newsdata.io");
  });
});
