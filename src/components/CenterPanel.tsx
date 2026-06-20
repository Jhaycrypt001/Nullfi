import { motion } from "motion/react";
import { ArrowUpRight, Copy, Inbox } from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import {
  STATUS_TONE,
  STATUS_ICON,
  STATUS_LABEL,
  TYPE_META,
  CONDITION_TONE,
  CONDITION_TYPE_LABEL,
} from "../lib/contractMeta";
import { ContractFlowDiagram } from "./SVG/ContractFlowDiagram";
import { ConditionProgressBar } from "./SVG/ConditionProgressBar";
import { TimeCountdown } from "./SVG/TimeCountdown";
import {
  formatMoney,
  formatDateTime,
  formatAddress,
} from "../utils/formatting";
import { fadeUp, conditionReveal, staggerContainer } from "../lib/motion";
import type { Contract, Condition, Transaction } from "../types";

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:bg-gray-100">
      <p className="text-label mb-2 text-gray-500">{label}</p>
      <div className="text-heading-lg font-bold text-[#111]">{children}</div>
    </div>
  );
}

function StatsRow({ contract }: { contract: Contract }) {
  const met = contract.conditions.filter((c) => c.status === "met").length;
  const total = contract.conditions.length;
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard label="Total Value Locked">
        {formatMoney(contract.totalValue, contract.tokenSymbol)}
      </StatCard>
      <StatCard label="Conditions Met">
        <div className="flex items-center gap-3">
          <span>
            {met} <span className="text-gray-400">of</span> {total}
          </span>
        </div>
        <div className="mt-2">
          <ConditionProgressBar
            percent={(met / Math.max(total, 1)) * 100}
            status="met"
            height={6}
          />
        </div>
      </StatCard>
      <StatCard label="Time Remaining">
        {contract.nextTrigger ? (
          <TimeCountdown target={contract.nextTrigger} />
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </StatCard>
      <StatCard label="Next Trigger">
        <span className="text-body-sm font-medium text-gray-700">
          {contract.nextTriggerLabel ?? "No pending triggers"}
        </span>
      </StatCard>
    </div>
  );
}

function ConditionRow({ condition }: { condition: Condition }) {
  const { openModal } = useAppState();
  const tone = CONDITION_TONE[condition.status];
  const Icon = tone.icon;

  const canAct = condition.status === "pending" || condition.status === "at-risk";
  const actionLabel =
    condition.type === "manual"
      ? "Approve"
      : condition.type === "milestone"
        ? "Submit"
        : "Execute";

  let timeline: { text: string; cls: string } | null = null;
  if (condition.status === "met" && condition.completedAt) {
    timeline = {
      text: `Completed: ${formatDateTime(condition.completedAt)}`,
      cls: "text-[#10b981]",
    };
  } else if (condition.status === "locked" && condition.dueDate) {
    timeline = {
      text: `Time-locked until: ${formatDateTime(condition.dueDate)}`,
      cls: "text-[#8b5cf6]",
    };
  } else if (condition.dueDate) {
    timeline = {
      text: `Due by: ${formatDateTime(condition.dueDate)}`,
      cls: "text-gray-500",
    };
  }

  return (
    <motion.div
      variants={conditionReveal}
      className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-4"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${tone.edge}`} />
      <div className="flex items-start gap-4 pl-2">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone.iconBg}`}>
          <Icon size={22} className={tone.iconText} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-body-sm font-bold text-[#111]">{condition.name}</h4>
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono-spec text-[9px] text-gray-500">
              {CONDITION_TYPE_LABEL[condition.type]}
            </span>
          </div>
          <p className="mt-1 text-body-sm leading-relaxed text-gray-600">
            {condition.description}
          </p>
          {timeline && (
            <p className={`text-label mt-2 ${timeline.cls}`}>{timeline.text}</p>
          )}
          {condition.progressLabel && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-label text-gray-500">{condition.progressLabel}</span>
              <div className="w-32">
                <ConditionProgressBar
                  percent={condition.completionPercent}
                  status={condition.status}
                  height={8}
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {canAct ? (
            <button
              type="button"
              onClick={() => openModal({ type: "execute-condition", data: condition })}
              className="text-label rounded-lg bg-[#0ea5e9] px-4 py-2 font-bold text-white transition-colors hover:bg-[#06b6d4]"
            >
              {actionLabel}
            </button>
          ) : (
            <span className="text-label text-gray-400">
              {condition.status === "met"
                ? "Done"
                : condition.status === "locked"
                  ? "Locked"
                  : "Failed"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TxBadge({ type }: { type: Transaction["type"] }) {
  const map: Record<Transaction["type"], string> = {
    lock: "bg-violet-100 text-[#8b5cf6]",
    release: "bg-green-100 text-[#10b981]",
    execution: "bg-blue-100 text-[#0ea5e9]",
  };
  return (
    <span className={`rounded px-2 py-1 font-mono-spec text-[10px] uppercase ${map[type]}`}>
      {type}
    </span>
  );
}

function TransactionHistory({ contract }: { contract: Contract }) {
  if (!contract.transactionHistory.length) {
    return <p className="text-body-sm text-gray-400">No transactions yet.</p>;
  }
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="text-label text-gray-500">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">From</th>
            <th className="pb-3 font-medium">To</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-body-sm">
          {contract.transactionHistory.map((tx) => (
            <tr key={tx.hash} className="border-t border-gray-200">
              <td className="py-3 text-gray-600">{formatDateTime(tx.timestamp).split(" @")[0]}</td>
              <td className="py-3"><TxBadge type={tx.type} /></td>
              <td className="py-3 font-semibold text-[#111]">
                {tx.amount > 0 ? formatMoney(tx.amount, contract.tokenSymbol) : "—"}
              </td>
              <td className="py-3 text-gray-600">{tx.from}</td>
              <td className="py-3 text-gray-600">{tx.to}</td>
              <td className="py-3">
                <span
                  className={`text-label ${
                    tx.status === "confirmed"
                      ? "text-[#10b981]"
                      : tx.status === "pending"
                        ? "text-[#f59e0b]"
                        : "text-[#ef4444]"
                  }`}
                >
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {contract.transactionHistory.map((tx) => (
          <div key={tx.hash} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TxBadge type={tx.type} />
                <span className="text-heading-md font-bold text-[#111]">
                  {tx.amount > 0 ? formatMoney(tx.amount, contract.tokenSymbol) : "—"}
                </span>
              </div>
              <span
                className={`text-label ${
                  tx.status === "confirmed" ? "text-[#10b981]" : "text-[#f59e0b]"
                }`}
              >
                {tx.status}
              </span>
            </div>
            <p className="mt-2 text-body-sm text-gray-600">
              {tx.from} → {tx.to}
            </p>
            <div className="mt-1 flex items-center gap-2 font-mono-spec text-[11px] text-gray-400">
              {formatAddress(tx.hash, 10, 6)}
              <Copy
                size={12}
                className="cursor-pointer hover:text-gray-600"
                onClick={() => navigator.clipboard?.writeText(tx.hash)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
      <Inbox size={48} className="text-gray-300" />
      <h3 className="text-heading-lg mt-4 text-[#111]">No contract selected</h3>
      <p className="mt-2 max-w-sm text-body-sm text-gray-500">
        Select a contract from the sidebar to inspect its logic, conditions, and
        transaction flow.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-lg bg-white p-6 md:bg-gray-100 md:p-8">
      <h3 className="text-heading-md mb-6 text-[#111]">{title}</h3>
      {children}
    </div>
  );
}

export function CenterPanel() {
  const { selectedContract } = useAppState();

  if (!selectedContract) {
    return (
      <main className="flex-1 overflow-y-auto bg-white md:bg-gray-50">
        <EmptyState />
      </main>
    );
  }

  const c = selectedContract;
  const tone = STATUS_TONE[c.status];
  const StatusIcon = STATUS_ICON[c.status];

  return (
    <main className="flex-1 overflow-y-auto bg-white md:bg-gray-50">
      <motion.div
        key={c.id}
        variants={fadeUp}
        initial="initial"
        animate="animate"
      >
        {/* Breadcrumb + header */}
        <div className="border-b border-gray-200 p-6 md:p-8">
          <p className="text-label mb-4 text-gray-500">
            Home / Contracts / {c.name}
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-display-md font-bold text-[#111] md:text-display-lg">
                {c.name}
              </h1>
              <p className="mt-1 text-body-sm text-gray-600">
                {TYPE_META[c.type].label}
              </p>
            </div>
            <div className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-3 ${tone.bg}`}>
              <StatusIcon size={24} className={tone.text} />
              <span className={`text-label mt-2 ${tone.text}`}>
                {STATUS_LABEL[c.status]}
              </span>
            </div>
          </div>

          <StatsRow contract={c} />
        </div>

        <div className="p-6 md:p-8">
          {/* Flow diagram */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 md:bg-gray-100 md:p-8">
            <ContractFlowDiagram contract={c} />
          </div>

          {/* Conditions */}
          <Section title="Contract Rules & Conditions">
            <motion.div
              variants={staggerContainer(0.1)}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {c.conditions.map((cond) => (
                <ConditionRow key={cond.id} condition={cond} />
              ))}
            </motion.div>
          </Section>

          {/* Transactions */}
          <Section title="Transaction Flow">
            <TransactionHistory contract={c} />
          </Section>

          <div className="mt-6 flex items-center justify-center gap-1 pb-8 text-label text-gray-400">
            <span>End-to-end verifiable on {""}</span>
            <span className="flex items-center gap-1 text-[#0ea5e9]">
              Sui <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
