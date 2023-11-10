import { RateLimitingMiddleware } from './rate-limiting.middleware';

describe('RateLimitingMiddleware', () => {
  it('should be defined', () => {
    expect(new RateLimitingMiddleware()).toBeDefined();
  });
});
