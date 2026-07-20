import { describe, expect, it } from "vitest";
import {
  getClientIp,
  getRegistrationRateLimitKeys,
} from "@/server/request-client";

describe("getClientIp", () => {
  it("uses the first address from a forwarded chain", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.8, 10.0.0.1",
    });
    expect(getClientIp(headers)).toBe("203.0.113.8");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.4" });
    expect(getClientIp(headers)).toBe("198.51.100.4");
  });
});

describe("getRegistrationRateLimitKeys", () => {
  it("separates valid registration attempts by normalized email", () => {
    expect(
      getRegistrationRateLimitKeys("203.0.113.8", "User@Example.com"),
    ).toEqual({
      address: "register-ip:203.0.113.8",
      account: "register:203.0.113.8:user@example.com",
    });
  });
});
