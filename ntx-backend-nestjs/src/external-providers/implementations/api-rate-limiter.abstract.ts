export const ApplyCallRateLimit =
  (options: { returnValueOnRateLimit: any }) =>
  (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (!this.canCall()) {
        if (this.logger) {
          this.logger.error(`Rate limit exceeded`);
        }

        return options.returnValueOnRateLimit;
      }

      this.updateLastCallTime();

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };

export abstract class APIRateLimiter {
  protected lastCallTime: number = 0;
  protected timeBetweenCallsMs: number;
  private isInitialized = false;

  public initializeRateLimiter(timeBetweenCallsMs = 5.0) {
    this.timeBetweenCallsMs = timeBetweenCallsMs;
    this.isInitialized = true;
  }

  public canCall(): boolean {
    this.throwIfNotInitialized();

    return Date.now() - this.lastCallTime > this.timeBetweenCallsMs;
  }

  public timeToNextCall(): number {
    this.throwIfNotInitialized();

    return Math.max(0, Date.now() - this.lastCallTime - this.timeBetweenCallsMs);
  }

  public resetRateLimit(): void {
    this.throwIfNotInitialized();

    this.lastCallTime = 0;
  }

  protected updateLastCallTime(): void {
    this.throwIfNotInitialized();

    this.lastCallTime = Date.now();
  }

  private throwIfNotInitialized() {
    if (!this.isInitialized) {
      throw new Error('Rate limiter not initialized');
    }
  }
}
