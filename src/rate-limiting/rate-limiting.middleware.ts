import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private requests: Map<string, { count: number; timestamp: number }> =
    new Map();

  use(req: Request, res: Response, next: NextFunction) {
    const timestamp = Date.now();
    this.setRequestCount(req.ip, timestamp);
    this.setRequestCount(req.query.user as string, timestamp);

    const ipRequestCount = this.getRequestCount(req.ip);
    const idRequestCount = this.getRequestCount(req.query.user as string);

    if (ipRequestCount > 10 || idRequestCount > 5) {
      return res.status(429).json({ ip: ipRequestCount, id: idRequestCount });
    }
    next();
  }

  private setRequestCount(key: string, timestamp: number) {
    const current = this.requests.get(key);
    if (!current || timestamp - current.timestamp > 60 * 1000) {
      this.requests.set(key, { count: 1, timestamp });
    } else {
      current.count += 1;
      this.requests.set(key, current);
    }
  }

  private getRequestCount(key: string): number {
    const current = this.requests.get(key);
    return current ? current.count : 0;
  }
}
