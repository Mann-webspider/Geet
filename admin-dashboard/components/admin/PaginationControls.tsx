"use client";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  limit,
  offset,
  count,
  onChange,
}: {
  limit: number;
  offset: number;
  count: number; // current page count
  onChange: (next: { limit: number; offset: number }) => void;
}) {
  const canPrev = offset > 0;
  const canNext = count === limit; // heuristic (server doesn't return total)

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onChange({ limit, offset: Math.max(0, offset - limit) })}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onChange({ limit, offset: offset + limit })}
      >
        Next
      </Button>
    </div>
  );
}
