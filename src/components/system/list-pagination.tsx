"use client";

export function ListPagination({
  page,
  lastPage,
  onPageChange,
}: {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <button
        type="button"
        className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page} of {lastPage}
      </span>
      <button
        type="button"
        className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
