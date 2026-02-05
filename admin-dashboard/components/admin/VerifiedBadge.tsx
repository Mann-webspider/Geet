import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) return null;
  return (
    <Badge variant="default" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      Verified
    </Badge>
  );
}
