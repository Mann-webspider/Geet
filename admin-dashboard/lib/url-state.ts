"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParams(next: Record<string, string | number | null | undefined>, opts?: { scroll?: boolean }) {
    const params = new URLSearchParams(searchParams);

    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: opts?.scroll ?? false });
  }

  return { searchParams, setParams };
}
