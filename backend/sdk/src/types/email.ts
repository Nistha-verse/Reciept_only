// Internal parsed source and public verification options, without raw output.
export type DnsResolver = (name: string, type: string) => Promise<string[][]>;
export interface VerifyOptions {
  resolver?: DnsResolver;
  now?: () => Date;
  offline?: boolean;
  dnsCachePath?: string;
}
export interface ParsedEmail {
  bytes: Buffer;
  headers: Map<string, string[]>;
}
export interface DkimResult {
  signingHeaders?: { keys: string };
  signingDomain?: string;
  signature?: string;
  algo?: string;
  modulusLength?: number;
  status: { result: string; comment?: string; policy?: Record<string, string> };
  canonBodyLengthLimited?: boolean;
}
