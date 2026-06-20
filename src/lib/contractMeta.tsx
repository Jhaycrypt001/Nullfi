// ───────────────────────────────────────────────────────────
// Maps domain enums → presentation (colors, icons, labels).
// ───────────────────────────────────────────────────────────
import {
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Lock,
  Coins,
  Banknote,
  ShieldCheck,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type {
  ContractType,
  ContractStatus,
  ConditionStatus,
  ConditionType,
} from "../types";

export interface Tone {
  text: string;
  bg: string;
  hex: string;
}

export const STATUS_TONE: Record<ContractStatus, Tone> = {
  active: { text: "text-[#10b981]", bg: "bg-green-100", hex: "#10b981" },
  pending: { text: "text-[#f59e0b]", bg: "bg-amber-100", hex: "#f59e0b" },
  completed: { text: "text-[#111]", bg: "bg-gray-100", hex: "#111111" },
  breached: { text: "text-[#ef4444]", bg: "bg-red-100", hex: "#ef4444" },
};

export const STATUS_ICON: Record<ContractStatus, LucideIcon> = {
  active: CheckCircle,
  pending: Clock,
  completed: CheckCircle,
  breached: AlertCircle,
};

export const STATUS_LABEL: Record<ContractStatus, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  breached: "Breached",
};

/** small status dot color for list items */
export const STATUS_DOT: Record<ContractStatus, string> = {
  active: "bg-[#10b981]",
  pending: "bg-[#f59e0b]",
  completed: "bg-gray-400",
  breached: "bg-[#ef4444]",
};

export const TYPE_META: Record<
  ContractType,
  { label: string; short: string; icon: LucideIcon; gradient: string }
> = {
  loan: { label: "Programmable Loan", short: "LOAN", icon: Banknote, gradient: "gradient-payment" },
  escrow: { label: "Milestone Escrow", short: "ESCROW", icon: ShieldCheck, gradient: "gradient-escrow" },
  payment: { label: "Payment-Linked Credit", short: "PAY", icon: Coins, gradient: "gradient-payment" },
  treasury: { label: "Treasury Control", short: "TREAS", icon: Landmark, gradient: "gradient-treasury" },
};

export interface ConditionTone {
  hex: string;
  iconBg: string;
  iconText: string;
  bar: string;
  edge: string;
  icon: LucideIcon;
}

export const CONDITION_TONE: Record<ConditionStatus, ConditionTone> = {
  met: {
    hex: "#10b981",
    iconBg: "bg-green-100",
    iconText: "text-[#10b981]",
    bar: "bg-[#10b981]",
    edge: "bg-[#10b981]",
    icon: CheckCircle,
  },
  pending: {
    hex: "#f59e0b",
    iconBg: "bg-amber-100",
    iconText: "text-[#f59e0b]",
    bar: "bg-[#f59e0b]",
    edge: "bg-[#f59e0b]",
    icon: Clock,
  },
  "at-risk": {
    hex: "#ef4444",
    iconBg: "bg-red-100",
    iconText: "text-[#ef4444]",
    bar: "bg-[#ef4444]",
    edge: "bg-[#ef4444]",
    icon: AlertTriangle,
  },
  failed: {
    hex: "#ef4444",
    iconBg: "bg-red-100",
    iconText: "text-[#ef4444]",
    bar: "bg-[#ef4444]",
    edge: "bg-[#ef4444]",
    icon: AlertCircle,
  },
  locked: {
    hex: "#8b5cf6",
    iconBg: "bg-violet-100",
    iconText: "text-[#8b5cf6]",
    bar: "bg-[#8b5cf6]",
    edge: "bg-[#8b5cf6]",
    icon: Lock,
  },
};

export const CONDITION_TYPE_LABEL: Record<ConditionType, string> = {
  timelock: "Time Lock",
  milestone: "Milestone",
  oracle: "Oracle-based",
  manual: "Manual Approval",
};
