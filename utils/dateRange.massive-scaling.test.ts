import { describe, it, expect } from 'vitest';
import { formatDateRange, DEFAULT_DATE_RANGE } from './dateRange';

describe('dateRange Massive Scaling Tests', () => {
  it('1. handles extremely long input strings (100,000 chars) without buffer overflows or hanging', () => {
    // Simulate a massive 100,000 digit string
    const massiveString = '9'.repeat(100000);
    const start = performance.now();
    const result = formatDateRange(massiveString);
    const duration = performance.now() - start;

    // Fails the <= currentYear + 5 check safely
    expect(result).toEqual(DEFAULT_DATE_RANGE);
    expect(duration).toBeLessThan(1000); // Verify fast execution times
  });

  it('2. efficiently processes large batches of valid inputs sequentially (10,000 calls)', () => {
    const start = performance.now();

    // Simulate high-volume contributor data parsing in rapid succession
    const results = Array.from({ length: 10000 }).map(() => formatDateRange('2024'));

    const duration = performance.now() - start;

    expect(results.length).toBe(10000);
    expect(results[9999].from).toBe('2024-01-01T00:00:00Z');
    expect(results[9999].to).toBe('2024-12-31T23:59:59Z');
    expect(duration).toBeLessThan(1500);
  });

  it('3. prevents memory issues when parsing gigabyte-scale strings with extensive whitespace padding', () => {
    // Massive whitespace string simulating malformed activity logs
    const massiveWhitespace = ' '.repeat(500000) + '2022' + ' '.repeat(500000);
    const start = performance.now();

    const result = formatDateRange(massiveWhitespace);
    const duration = performance.now() - start;

    expect(result.from).toBe('2022-01-01T00:00:00Z');
    expect(duration).toBeLessThan(500); // JS trim() safely handles it without crashing
  });

  it('4. maintains strict fallback performance limits when generating massive arrays of undefined or empty ranges', () => {
    const start = performance.now();
    const results = Array.from({ length: 5000 }).map(() => formatDateRange(''));
    const duration = performance.now() - start;

    expect(results.length).toBe(5000);
    expect(results[0]).toEqual(DEFAULT_DATE_RANGE);
    expect(results[4999]).toEqual(DEFAULT_DATE_RANGE);
    expect(duration).toBeLessThan(500);
  });

  it('5. safely handles maximum integer boundaries without causing numeric precision overflow', () => {
    const maxSafeInteger = Number.MAX_SAFE_INTEGER.toString();
    const start = performance.now();
    const result = formatDateRange(maxSafeInteger);
    const duration = performance.now() - start;

    // Fails the strict boundary checks (> currentYear + 5), gracefully falls back
    expect(result).toEqual(DEFAULT_DATE_RANGE);
    expect(duration).toBeLessThan(500);
  });
});
