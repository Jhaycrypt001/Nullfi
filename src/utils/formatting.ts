// ───────────────────────────────────────────────────────────
// Formatting helpers
// ───────────────────────────────────────────────────────────

/** 0x1234…abcd */
export function formatAddress(address: string, lead = 6, tail = 4): string {
  if (!address) return "";
  if (address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMoney(value: number, token = "USDC"): string {
  return `$${formatNumber(value)} ${token}`;
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 hours ago", "in 4 hours" */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = timestamp - now;
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return RTF.format(Math.round(diff / 1000), "second");
  if (abs < hour) return RTF.format(Math.round(diff / minute), "minute");
  if (abs < day) return RTF.format(Math.round(diff / hour), "hour");
  return RTF.format(Math.round(diff / day), "day");
}

/** "Jun 15, 2026 @ 5:00 PM UTC" */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
  return `${date} @ ${time} UTC`;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalMs: number;
}

export function getCountdown(target: number, now = Date.now()): Countdown {
  const totalMs = target - now;
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0 };
  }
  const s = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    expired: false,
    totalMs,
  };
}

/** "4d 12h 34m" */
export function formatCountdown(c: Countdown, withSeconds = false): string {
  if (c.expired) return "EXPIRED";
  const parts = [`${c.days}d`, `${c.hours}h`, `${c.minutes}m`];
  if (withSeconds) parts.push(`${c.seconds}s`);
  return parts.join(" ");
}
