import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { useAppState } from "../../hooks/useAppState";
import { TYPE_META, CONDITION_TYPE_LABEL } from "../../lib/contractMeta";
import type {
  Contract,
  ContractType,
  ConditionType,
} from "../../types";

const TYPE_OPTIONS: { type: ContractType; desc: string }[] = [
  { type: "loan", desc: "Collateralized, programmable repayment schedule" },
  { type: "escrow", desc: "Release funds as milestones are verified" },
  { type: "payment", desc: "Credit linked to recurring payment streams" },
  { type: "treasury", desc: "Rules-based, capped treasury allocations" },
];

const TOKENS = [
  { symbol: "USDC", balance: "12,480.55" },
  { symbol: "SUI", balance: "8,210.00" },
  { symbol: "USDT", balance: "3,002.18" },
];

const CONDITION_TYPES: ConditionType[] = ["timelock", "milestone", "oracle", "manual"];

interface DraftCondition {
  id: string;
  type: ConditionType;
  detail: string;
}

let draftSeq = 0;
const newCondition = (): DraftCondition => ({
  id: `draft-${draftSeq++}`,
  type: "milestone",
  detail: "",
});

export function CreateContractModal() {
  const { closeModal, addContract } = useAppState();

  const [type, setType] = useState<ContractType>("escrow");
  const [initiator, setInitiator] = useState("");
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState(TOKENS[0].symbol);
  const [amount, setAmount] = useState("");
  const [conditions, setConditions] = useState<DraftCondition[]>([newCondition()]);
  const [acknowledged, setAcknowledged] = useState(false);

  const tokenBalance = TOKENS.find((t) => t.symbol === token)?.balance ?? "0";
  const canSubmit =
    recipient.trim().length > 0 && Number(amount) > 0 && acknowledged;

  function updateCondition(id: string, patch: Partial<DraftCondition>) {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleCreate() {
    const now = Date.now();
    const contract: Contract = {
      id: `ctr-${now}`,
      name: `${TYPE_META[type].label} #${Math.floor(Math.random() * 9000 + 1000)}`,
      type,
      status: "pending",
      initiator: initiator || "0x0000…you",
      initiatorName: "alice.sui",
      recipient,
      recipientName: recipient.endsWith(".sui") ? recipient : "recipient.sui",
      tokenSymbol: token,
      totalValue: Number(amount),
      releasedValue: 0,
      createdAt: now,
      updatedAt: now,
      nextTrigger: now + 7 * 24 * 60 * 60 * 1000,
      nextTriggerLabel: "First condition review",
      conditions: conditions.map((c, i) => ({
        id: `${c.id}`,
        name: c.detail || `${CONDITION_TYPE_LABEL[c.type]} ${i + 1}`,
        type: c.type,
        status: "pending",
        completionPercent: 0,
        description: c.detail || "Newly created condition awaiting first evaluation.",
        dueDate: now + (i + 1) * 3 * 24 * 60 * 60 * 1000,
        createdAt: now,
      })),
      transactionHistory: [],
    };
    addContract(contract);
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-body-sm placeholder-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-[#0ea5e9]";
  const labelCls = "text-label mb-2 block text-gray-700";

  return (
    <ModalShell onClose={closeModal} labelledBy="create-contract-title">
      <h2
        id="create-contract-title"
        className="text-heading-lg border-b border-gray-200 p-6 text-[#111]"
      >
        Create New Contract
      </h2>

      <div className="flex flex-col gap-6 p-6">
        {/* Type */}
        <div>
          <label className={labelCls}>Contract Type</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TYPE_OPTIONS.map(({ type: t, desc }) => {
              const meta = TYPE_META[t];
              const Icon = meta.icon;
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                    selected
                      ? "bg-blue-50 ring-2 ring-[#0ea5e9]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.gradient} text-white`}>
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-body-sm font-semibold text-[#111]">
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
                      {desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Initiator Address</label>
            <input
              className={inputCls}
              placeholder="0x… (defaults to you)"
              value={initiator}
              onChange={(e) => setInitiator(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Recipient Address</label>
            <input
              className={inputCls}
              placeholder="0x… or name.sui"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
        </div>

        {/* Terms */}
        <div>
          <label className={labelCls}>Token & Amount</label>
          <div className="flex gap-3">
            <div className="w-40">
              <select
                className={`${inputCls} cursor-pointer`}
                value={token}
                onChange={(e) => setToken(e.target.value)}
              >
                {TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">Balance: {tokenBalance}</p>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                className={inputCls}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-gray-400">
                {token}
              </span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div>
          <label className={labelCls}>Contract Conditions</label>
          <div className="space-y-3">
            {conditions.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <select
                  className={`${inputCls} w-44 cursor-pointer`}
                  value={c.type}
                  onChange={(e) =>
                    updateCondition(c.id, { type: e.target.value as ConditionType })
                  }
                >
                  {CONDITION_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {CONDITION_TYPE_LABEL[ct]}
                    </option>
                  ))}
                </select>
                <input
                  className={inputCls}
                  placeholder={
                    c.type === "oracle"
                      ? "e.g. BTC price > $50k"
                      : c.type === "timelock"
                        ? "Unlock date / description"
                        : "Condition description"
                  }
                  value={c.detail}
                  onChange={(e) => updateCondition(c.id, { detail: e.target.value })}
                />
                <button
                  type="button"
                  aria-label="Remove condition"
                  onClick={() =>
                    setConditions((prev) =>
                      prev.length > 1 ? prev.filter((x) => x.id !== c.id) : prev
                    )
                  }
                  className="mt-3 text-red-500 transition-colors hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setConditions((prev) => [...prev, newCondition()])}
            className="text-label mt-4 flex items-center gap-1 font-medium text-[#0ea5e9] hover:underline"
          >
            <Plus size={14} /> Add Condition
          </button>
        </div>

        {/* Acknowledge */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#0ea5e9]"
          />
          <span className="text-body-sm text-gray-700">
            I understand this contract enforces its logic programmatically and
            settles on-chain.
          </span>
        </label>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
        <button
          type="button"
          onClick={closeModal}
          className="text-label rounded-lg bg-gray-200 px-6 py-2 font-medium text-[#111] hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleCreate}
          className="text-label rounded-lg bg-[#0ea5e9] px-6 py-2 font-bold text-white transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create Contract
        </button>
      </div>
    </ModalShell>
  );
}
