import type { MusicRequestPriority } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function PriorityBadge({ priority }: { priority: MusicRequestPriority }) {
  const text = priority === "high" ? "High" : priority === "low" ? "Low" : "Normal";
  const variant = priority === "high" ? "destructive" : priority === "low" ? "secondary" : "outline";
  return <Badge variant={variant}>{text}</Badge>;
}
