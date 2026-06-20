import { motion } from "motion/react";
import type { ConditionStatus } from "../../types";
import { CONDITION_TONE } from "../../lib/contractMeta";

interface Props {
  percent: number;
  status: ConditionStatus;
  className?: string;
  height?: number;
}

/** Visual bar showing completion %. Color is status-driven; glows on hover. */
export function ConditionProgressBar({
  percent,
  status,
  className = "",
  height = 8,
}: Props) {
  const tone = CONDITION_TONE[status];
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`group/bar w-full overflow-hidden rounded-full bg-[#e5e7eb] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full rounded-full ${tone.bar} transition-shadow group-hover/bar:shadow-[0_0_8px_var(--glow)]`}
        style={{ ["--glow" as string]: tone.hex }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
