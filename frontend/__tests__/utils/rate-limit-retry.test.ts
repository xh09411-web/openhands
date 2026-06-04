import { AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRateLimitRetryDelayMs,
  isRateLimitError,
} from "#/utils/rate-limit-retry";

const createAxiosError = (status: number, headers?: unknown): AxiosError =>
  ({
    response: {
      status,
      headers,
    },
  }) as unknown as AxiosError;

describe("rate limit retry helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("recognizes response status 429 as a rate-limit error", () => {
    expect(isRateLimitError(createAxiosError(429))).toBe(true);
    expect(isRateLimitError(createAxiosError(500))).toBe(false);
  });

  it("uses AxiosHeaders get() before falling back to enumerable headers", () => {
    const headers = {
      "retry-after": "5",
      get: (headerName: string) =>
        headerName.toLowerCase() === "retry-after" ? "2" : undefined,
    };

    expect(getRateLimitRetryDelayMs(createAxiosError(429, headers))).toBe(2000);
  });

  it("parses Retry-After HTTP dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T20:00:00.000Z"));

    const retryAt = new Date("2026-06-04T20:00:03.000Z").toUTCString();

    expect(
      getRateLimitRetryDelayMs(
        createAxiosError(429, {
          "retry-after": retryAt,
        }),
      ),
    ).toBe(3000);
  });

  it("falls back to one second when Retry-After is missing", () => {
    expect(getRateLimitRetryDelayMs(createAxiosError(429))).toBe(1000);
  });
});
