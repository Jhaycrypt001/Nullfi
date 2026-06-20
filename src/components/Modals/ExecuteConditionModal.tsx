import { useState } from "react";
import { CheckCircle, Lock, Loader2, Copy, ExternalLink } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { useAppState } from "../../hooks/useAppState";
import type { Condition } from "../../types";

type Phase = "review" | "pending" | "success" | "error";

const SOLIDITY_SNIPPET = `// Move (Sui) — release logic
public entry fun execute(
    escrow: &mut Escrow,
    condition_id: u64,
    ctx: &mut TxContext,
) {
    assert!(is_met(escrow, condition_id), E_NOT_MET);
    let amount = release_amount(escrow, condition_id);
    transfer::public_transfer(
        coin::split(&mut escrow.vault, amount, ctx),
        escrow.recipient,
    );
}`;

export function ExecuteConditionModal({ condition }: { condition: Condition }) {
  const { closeModal } = useAppState();
  const [phase, setPhase] = useState<Phase>("review");
  const [confirmed, setConfirmed] = useState(false);

  const Icon = condition.type === "timelock" ? Lock : CheckCircle;
  const txHash = "0x4f3a9c2e1b8d4a60f5e2c1d9b7a83f4e6c0d2a917a3f9c2e1b8d4a60f5e2c1d9";

  function run() {
    setPhase("pending");
    // Simulated on-chain settlement.
    window.setTimeout(() => setPhase("success"), 2600);
  }

  return (
    <ModalShell onClose={closeModal} maxWidth="500px" labelledBy="exec-title">
      <h2
        id="exec-title"
        className="text-heading-lg flex items-center gap-3 border-b border-gray-200 p-6 text-[#111]"
      >
        <Icon size={28} className="text-[#0ea5e9]" />
        Execute: {condition.name}
      </h2>

      <div className="p-6">
        {phase === "review" && (
          <>
            <p className="text-body leading-relaxed text-gray-700">
              This will evaluate <strong>{condition.name}</strong> on-chain and, if
              satisfied, release the corresponding funds and trigger the next step
              of the contract.
            </p>

            <details className="group mt-4">
              <summary className="text-label cursor-pointer font-medium text-[#0ea5e9]">
                View contract code
              </summary>
              <pre className="text-code mt-3 overflow-x-auto rounded-lg bg-gray-100 p-4 text-gray-900">
                {SOLIDITY_SNIPPET}
              </pre>
            </details>

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#10b981]"
              />
              <span className="text-body-sm text-gray-700">
                I understand this action is irreversible.
              </span>
            </label>
          </>
        )}

        {phase === "pending" && (
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 size={40} className="animate-spin text-[#0ea5e9]" />
            <p className="text-body mt-4 font-medium text-[#111]">
              Transaction pending…
            </p>
            <p className="text-body-sm mt-1 text-gray-500">
              Submitting to Sui and awaiting finality.
            </p>
          </div>
        )}

        {phase === "success" && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle size={44} className="text-[#10b981]" />
            <p className="text-body mt-4 font-semibold text-[#111]">
              Condition executed!
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 font-mono-spec text-[11px] text-gray-600">
              {txHash.slice(0, 14)}…{txHash.slice(-8)}
              <Copy
                size={13}
                className="cursor-pointer hover:text-gray-900"
                onClick={() => navigator.clipboard?.writeText(txHash)}
              />
              <ExternalLink size={13} className="cursor-pointer hover:text-gray-900" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
        {phase === "review" && (
          <>
            <button
              type="button"
              onClick={closeModal}
              className="text-label rounded-lg bg-gray-200 px-6 py-2 font-medium text-[#111] hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!confirmed}
              onClick={run}
              className="text-label rounded-lg bg-[#10b981] px-6 py-2 font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Execute
            </button>
          </>
        )}
        {phase === "success" && (
          <button
            type="button"
            onClick={closeModal}
            className="text-label rounded-lg bg-[#0ea5e9] px-6 py-2 font-bold text-white hover:bg-[#06b6d4]"
          >
            Done
          </button>
        )}
      </div>
    </ModalShell>
  );
}
