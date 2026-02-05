import type { MusicRequestStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function variantFor(status: MusicRequestStatus) {
  switch (status) {
    case "submitted":
      return "secondary";
    case "in_review":
      return "default";
    case "in_progress":
      return "outline";
    case "completed":
      return "default";
    case "rejected":
      return "destructive";
  }
}

function labelFor(status: MusicRequestStatus) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "in_review":
      return "In review";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
  }
}

export function StatusBadge({ status }: { status: MusicRequestStatus }) {
  return <Badge variant={variantFor(status)}>{labelFor(status)}</Badge>;
}
