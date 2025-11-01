export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;
  private retryCount = 0;
  private lastError: Error | null = null;

  constructor(
    config: ErrorRecoveryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    }
  ) {
    this.config = config;
  }

  async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      this.retryCount = 0;
      return await fn();
    } catch (error) {
      this.lastError =
        error instanceof Error ? error : new Error(String(error));
      return this.retry(fn);
    }
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    if (this.retryCount >= this.config.maxRetries) {
      throw new Error(`Max retries reached: ${this.lastError?.message}`);
    }

    const delay =
      this.config.retryDelay *
      Math.pow(this.config.backoffMultiplier, this.retryCount);
    await new Promise((res) => setTimeout(res, delay));

    this.retryCount++;
    try {
      return await fn();
    } catch (error) {
      this.lastError =
        error instanceof Error ? error : new Error(String(error));
      return this.retry(fn);
    }
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  reset() {
    this.retryCount = 0;
    this.lastError = null;
  }
}
