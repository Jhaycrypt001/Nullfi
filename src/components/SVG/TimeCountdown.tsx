import { useEffect, useState } from "react";
import { getCountdown, formatCountdown } from "../../utils/formatting";

interface Props {
  target: number;
  withSeconds?: boolean;
  className?: string;
}

/** Live "4d 12h 34m" countdown. Turns amber in the final 24h, red when expired. */
export function TimeCountdown({ target, withSeconds = true, className = "" }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const c = getCountdown(target, now);
  const urgent = !c.expired && c.totalMs < 24 * 60 * 60 * 1000;
  const color = c.expired
    ? "text-[#ef4444]"
    : urgent
      ? "text-[#f59e0b]"
      : "text-[#111]";

  return (
    <span
      className={`tabular-nums font-mono-spec ${color} ${urgent ? "animate-pulse" : ""} ${className}`}
    >
      {formatCountdown(c, withSeconds)}
    </span>
  );
}
