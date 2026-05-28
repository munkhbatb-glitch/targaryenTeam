import { Injectable } from '@nestjs/common';

@Injectable()
export class InviteRateLimitService {
  private readonly attempts = new Map<string, number[]>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 60 * 60 * 1000;

  check(key: string): boolean {
    const now = Date.now();
    const recent = (this.attempts.get(key) || []).filter(
      (time) => now - time < this.windowMs,
    );

    if (recent.length >= this.maxAttempts) {
      this.attempts.set(key, recent);
      return false;
    }

    recent.push(now);
    this.attempts.set(key, recent);
    return true;
  }
}
