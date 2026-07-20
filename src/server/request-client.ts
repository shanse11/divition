export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export function getRegistrationRateLimitKeys(ip: string, email: string) {
  return {
    address: `register-ip:${ip}`,
    account: `register:${ip}:${email.trim().toLowerCase()}`,
  };
}
