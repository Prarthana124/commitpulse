import { beforeEach, describe, expect, it, vi } from 'vitest';
import refreshRateLimiter from './refresh-rate-limiter';

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('RefreshRateLimiter responsive breakpoints', () => {
  beforeEach(() => {
    refreshRateLimiter.reset();
    setViewportWidth(1280);
    mockMatchMedia(false);
  });

  it('allows refreshes normally on a mobile-width viewport (375px)', () => {
    setViewportWidth(375);
    mockMatchMedia(true);

    const response = refreshRateLimiter.checkLimit('203.0.113.5');

    expect(window.innerWidth).toBe(375);
    expect(response.success).toBe(true);
    expect(response.limit).toBe(3);
    expect(response.remaining).toBe(2);
  });

  it('maintains the same rate-limit behavior when switching from desktop to mobile widths', () => {
    setViewportWidth(1280);
    const desktopResponse = refreshRateLimiter.checkLimit('198.51.100.10');

    setViewportWidth(375);
    mockMatchMedia(true);
    const mobileResponse = refreshRateLimiter.checkLimit('198.51.100.10');

    expect(window.innerWidth).toBe(375);
    expect(desktopResponse.success).toBe(true);
    expect(mobileResponse.success).toBe(true);
    expect(mobileResponse.remaining).toBe(desktopResponse.remaining - 1);
  });

  it('reports cleanly when a mobile breakpoint is active and the same IP checks again', () => {
    setViewportWidth(375);
    mockMatchMedia(true);

    const first = refreshRateLimiter.checkLimit('127.0.0.1');
    const second = refreshRateLimiter.checkLimit('127.0.0.1');

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);
    expect(first.limit).toBe(3);
  });

  it('enforces a custom mobile friendly limit without breaking on narrow viewports', () => {
    setViewportWidth(375);
    mockMatchMedia(true);
    refreshRateLimiter.setLimit(1, 60 * 60 * 1000);

    const allowed = refreshRateLimiter.checkLimit('203.0.113.15');
    const blocked = refreshRateLimiter.checkLimit('203.0.113.15');

    expect(allowed.success).toBe(true);
    expect(allowed.remaining).toBe(0);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.limit).toBe(1);
  });

  it('keeps responsive viewport simulation clean and does not depend on absolute width assumptions', () => {
    setViewportWidth(375);
    mockMatchMedia(true);

    const response = refreshRateLimiter.checkLimit('192.0.2.1');

    expect(window.innerWidth).toBeLessThanOrEqual(375);
    expect(response.success).toBe(true);
    expect(response.reset).toBeGreaterThan(Date.now() - 1000);
    expect(response.limit).toBe(3);
  });
});
