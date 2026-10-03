// Memory-only receipt state machine; raw source is cleared on exit, success and cancellation.
import { create } from "zustand";
import type { ReceiptSource, ReceiptSummary, Posted } from "@/lib/sdk";
export const STEPS = ["Receipt", "Check", "Review", "Publish", "Done"] as const;
export type Step = 0 | 1 | 2 | 3 | 4;
export interface Draft {
  step: Step;
  source: ReceiptSource | null;
  receipt: ReceiptSummary | null;
  rating: number;
  text: string;
  demo: boolean;
  result: Posted | null;
}
export type WizardEvent =
  | { type: "SOURCE"; source: ReceiptSource }
  | { type: "CHECKING" }
  | { type: "VERIFIED"; receipt: ReceiptSummary }
  | { type: "WRITE"; rating: number; text: string }
  | { type: "READY" }
  | { type: "BACK" }
  | { type: "SUCCESS"; result: Posted }
  | { type: "RESET" };
export const initialDraft: Draft = {
  step: 0,
  source: null,
  receipt: null,
  rating: 0,
  text: "",
  demo: false,
  result: null,
};
export function reduceWizard(state: Draft, event: WizardEvent): Draft {
  switch (event.type) {
    case "SOURCE":
      return { ...state, source: event.source, receipt: null, step: 0 };
    case "CHECKING":
      return state.source ? { ...state, step: 1 } : state;
    case "VERIFIED":
      return state.source
        ? { ...state, receipt: event.receipt, step: 2 }
        : state;
    case "WRITE":
      return { ...state, rating: event.rating, text: event.text };
    case "READY":
      return state.receipt &&
        state.source &&
        state.rating >= 1 &&
        state.rating <= 5 &&
        state.text.trim() &&
        Array.from(state.text).length <= 280
        ? { ...state, step: 3 }
        : state;
    case "BACK":
      return { ...state, step: state.step === 3 ? 2 : 0 };
    case "SUCCESS":
      return { ...state, source: null, step: 4, result: event.result };
    case "RESET":
      return { ...initialDraft };
  }
}
export const useWizard = create<
  Draft & {
    dispatch: (event: WizardEvent) => void;
    setDemo: (enabled: boolean) => void;
  }
>((set) => ({
  ...initialDraft,
  dispatch: (event) => set((state) => reduceWizard(state, event)),
  setDemo: (demo) => set({ demo }),
}));
