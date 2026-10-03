// Memory-only interface preferences. No email, wallet or token persistence middleware.
import { create } from "zustand";
type Theme = "light" | "dark";
export const useUi = create<{ theme: Theme; toggleTheme: () => void }>(
  (set) => ({
    theme: "light",
    toggleTheme: () =>
      set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  }),
);
