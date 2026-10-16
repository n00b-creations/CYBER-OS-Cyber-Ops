import test from 'node:test';
import assert from 'node:assert/strict';
import { FixedWindowRateLimiter } from './rate-limit.js';

test('allows requests until the fixed-window limit is reached', () => {
  const limiter = new FixedWindowRateLimiter(2, 1_000);

  assert.deepEqual(limiter.consume('client', 0), {
    allowed: true,
    remaining: 1,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(limiter.consume('client', 100), {
    allowed: true,
    remaining: 0,
    retryAfterSeconds: 0,
  });
  assert.deepEqual(limiter.consume('client', 200), {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: 1,
  });
});

test('resets a bucket after the window expires', () => {
  const limiter = new FixedWindowRateLimiter(1, 1_000);

  assert.equal(limiter.consume('client', 0).allowed, true);
  assert.equal(limiter.consume('client', 999).allowed, false);
  assert.equal(limiter.consume('client', 1_000).allowed, true);
});

test('keeps client buckets isolated', () => {
  const limiter = new FixedWindowRateLimiter(1, 1_000);

  assert.equal(limiter.consume('a', 0).allowed, true);
  assert.equal(limiter.consume('a', 1).allowed, false);
  assert.equal(limiter.consume('b', 1).allowed, true);
});

test('prune removes expired buckets', () => {
  const limiter = new FixedWindowRateLimiter(1, 1_000);

  limiter.consume('expired', 0);
  limiter.consume('active', 500);
  limiter.prune(1_000);

  assert.equal(limiter.consume('expired', 1_000).allowed, true);
  assert.equal(limiter.consume('active', 1_000).allowed, false);
});
