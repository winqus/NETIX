export function delayByMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
