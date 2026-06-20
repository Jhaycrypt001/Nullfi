// ───────────────────────────────────────────────────────────
// NullFi — domain types
// ───────────────────────────────────────────────────────────

export type ContractType = "loan" | "escrow" | "payment" | "treasury";
export type ContractStatus = "active" | "pending" | "completed" | "breached";

export type ConditionType = "timelock" | "milestone" | "oracle" | "manual";
export type ConditionStatus = "met" | "pending" | "at-risk" | "failed" | "locked";

export type TxType = "lock" | "execution" | "release";
export type TxStatus = "pending" | "confirmed" | "failed";

export type ActivityType =
  | "condition_met"
  | "condition_failed"
  | "execution"
  | "alert";

export interface Condition {
  id: string;
  name: string;
  type: ConditionType;
  status: ConditionStatus;
  completionPercent: number;
  dueDate?: number;
  completedAt?: number;
  description: string;
  /** e.g. "3 of 4 reviewers approved" */
  progressLabel?: string;
  createdAt: number;
}

export interface Transaction {
  hash: string;
  type: TxType;
  amount: number;
  from: string;
  to: string;
  blockNumber: number;
  timestamp: number;
  status: TxStatus;
}

export interface Contract {
  id: string;
  name: string;
  type: ContractType;
  status: ContractStatus;
  initiator: string;
  initiatorName: string;
  recipient: string;
  recipientName: string;
  tokenSymbol: string;
  totalValue: number;
  /** amount currently available / released */
  releasedValue: number;
  conditions: Condition[];
  createdAt: number;
  updatedAt: number;
  nextTrigger?: number;
  nextTriggerLabel?: string;
  transactionHistory: Transaction[];
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: ActivityType;
  contractId: string;
  title: string;
  description: string;
  actor: string;
}

export type AlertLevel = "critical" | "warning" | "info";

export interface AlertItem {
  id: string;
  level: AlertLevel;
  message: string;
}

export interface ModalState {
  type: "create-contract" | "execute-condition";
  data?: unknown;
}
