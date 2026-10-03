// Reduced-motion-aware stamp for actual local check or submission outcomes.
import { m, useReducedMotion } from "framer-motion";
export function Stamp({
  denied = false,
  label,
}: {
  denied?: boolean;
  label?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, scale: 1.6, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className={`stamp ${denied ? "big-denied" : ""}`}
    >
      {label ?? (denied ? "No receipt · no entry" : "Receipt checked")}
    </m.div>
  );
}
