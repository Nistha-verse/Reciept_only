// Round gas up with a 20% margin; this is a limit buffer, not a fee prediction.
export const bufferedGas = (estimate: bigint) => (estimate * 120n + 99n) / 100n;
