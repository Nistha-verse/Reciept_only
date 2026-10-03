// Presentation-only helpers; no receipt hashing, proof, ABI or transaction logic.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...values: ClassValue[]) => twMerge(clsx(values));
export const shortHash = (value: string) =>
  `${value.slice(0, 6)}…${value.slice(-4)}`;
export function formatDate(value: string | number) {
  const date = new Date(typeof value === "number" ? value * 1000 : value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}
export const codePoints = (text: string) => Array.from(text).length;
export const byteCount = (text: string) =>
  new TextEncoder().encode(text).byteLength;
