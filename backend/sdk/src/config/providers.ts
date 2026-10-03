// Provider allowlist and reviewed template rules; add providers here, not in logic.
export interface Provider {
  id: string;
  domains: readonly string[];
  fallback: string;
  merchantSubjectPattern?: RegExp;
  templateStatus: string;
}
export const providers: readonly Provider[] = [
  {
    id: "zomato",
    domains: ["zomato.com"],
    fallback: "Zomato order",
    // VERIFY AGAINST A REAL SAMPLE. No Zomato sample exists locally; do not trust
    // arbitrary body text, customer names, order notes, or an invented pattern.
    merchantSubjectPattern: undefined,
    templateStatus: "VERIFY AGAINST A REAL SAMPLE",
  },
];
