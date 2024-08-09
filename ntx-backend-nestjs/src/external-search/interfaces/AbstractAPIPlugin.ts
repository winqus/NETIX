export default abstract class {
  abstract readonly pluginUUID: string;
  protected lastCallTime: number = 0;
  protected timeBetweenCallsMs: number;

  public canCall(): boolean {
    return Date.now() - this.lastCallTime > this.timeBetweenCallsMs;
  }

  public timeToNextCall(): number {
    return Math.max(0, Date.now() - this.lastCallTime - this.timeBetweenCallsMs);
  }

  public resetRateLimit(): void {
    this.lastCallTime = 0;
  }

  public updateLastCallTime(): void {
    this.lastCallTime = Date.now();
  }
}
