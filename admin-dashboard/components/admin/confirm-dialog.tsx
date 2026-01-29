"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConfirmStore } from "@/store/confirm-store";
import { cn } from "@/lib/utils";

export function ConfirmDialog() {
  const { open, close, options, onConfirm, onCancel, loading, setLoading } = useConfirmStore();

  async function handleConfirm() {
    if (!onConfirm) return;
    try {
      setLoading(true);
      await onConfirm();
      close();
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(v: boolean) {
    // when user closes by clicking outside / ESC
    if (!v) {
      onCancel?.();
      close();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title ?? "Are you sure?"}</AlertDialogTitle>
          {options?.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={() => { onCancel?.(); close(); }}>
            {options?.cancelText ?? "Cancel"}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={cn(options?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "")}
          >
            {loading ? "Working..." : (options?.confirmText ?? "Continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
