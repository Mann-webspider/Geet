import { create } from "zustand";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type ConfirmState = {
  open: boolean;
  loading: boolean;
  options: ConfirmOptions | null;
  // We store a function to run on confirm
  onConfirm: (() => Promise<void>) | null;
  // optional cleanup callback
  onCancel: (() => void) | null;

  ask: (options: ConfirmOptions, onConfirm: () => Promise<void>, onCancel?: () => void) => void;
  close: () => void;
  setLoading: (v: boolean) => void;
};

export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  loading: false,
  options: null,
  onConfirm: null,
  onCancel: null,

  ask: (options, onConfirm, onCancel) =>
    set({
      open: true,
      loading: false,
      options: {
        confirmText: "Continue",
        cancelText: "Cancel",
        destructive: true,
        ...options,
      },
      onConfirm,
      onCancel: onCancel ?? null,
    }),

  close: () =>
    set({
      open: false,
      loading: false,
      options: null,
      onConfirm: null,
      onCancel: null,
    }),

  setLoading: (v) => set({ loading: v }),
}));
