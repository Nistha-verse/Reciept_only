// Retry only idempotent reads on transient transport failures; never use for sends.
export function isTransient(error: unknown): boolean {
  const e = error as {
    name?: string;
    message?: string;
    cause?: unknown;
    status?: number;
  };
  return (
    !!e &&
    (e.status === 429 ||
      (e.status ?? 0) >= 500 ||
      /timeout|network|fetch failed|429|503|socket/i.test(
        `${e.name ?? ""} ${e.message ?? ""}`,
      ) ||
      (!!e.cause && isTransient(e.cause)))
  );
}
export async function retry<T>(
  read: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  for (let i = 0; ; i++) {
    try {
      return await read();
    } catch (error) {
      if (i + 1 >= attempts || !isTransient(error)) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, (options.delayMs ?? 250) * 2 ** i),
      );
    }
  }
}
