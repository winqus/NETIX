import { LoggerService } from '@nestjs/common/services/logger.service';
// TODO: move file to src/external-search//interfaces
export default abstract class {
  abstract readonly pluginUUID: string;
  protected lastCallTime: number = 0;
  protected timeBetweenCallsMs: number;

  constructor(protected logger: LoggerService) {
    if (logger == null) {
      throw new Error('LoggerService is required for plugin.');
    }
  }

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
