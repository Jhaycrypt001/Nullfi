import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { useAppState, type ContractFilter } from "../hooks/useAppState";
import { TYPE_META, STATUS_DOT } from "../lib/contractMeta";
import { formatRelative } from "../utils/formatting";
import { slideInLeft } from "../lib/motion";
import type { Contract } from "../types";

const FILTERS: { key: ContractFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "at-risk", label: "At Risk" },
];

function conditionPercent(c: Contract): number {
  if (!c.conditions.length) return 0;
  const met = c.conditions.filter((cd) => cd.status === "met").length;
  return Math.round((met / c.conditions.length) * 100);
}

function ContractCard({ contract }: { contract: Contract }) {
  const { selectedContractId, selectContract } = useAppState();
  const isActive = contract.id === selectedContractId;
  const type = TYPE_META[contract.type];
  const pct = conditionPercent(contract);

  const subtext = contract.nextTriggerLabel
    ? `Next trigger: ${contract.nextTrigger ? formatRelative(contract.nextTrigger) : "soon"}`
    : `Updated ${formatRelative(contract.updatedAt)}`;

  return (
    <button
      type="button"
      onClick={() => selectContract(contract.id)}
      className={`mb-2 block w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
        isActive
          ? "border-[#0ea5e9] bg-blue-50 shadow-sm"
          : "border-transparent hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center">
          <span className="truncate text-body-sm font-semibold text-[#111]">
            {contract.name}
          </span>
          <span className="ml-2 shrink-0 rounded bg-blue-100 px-2 py-0.5 font-mono-spec text-[9px] text-[#0ea5e9]">
            {type.short}
          </span>
        </div>
        <span className={`h-3 w-3 shrink-0 rounded-full ${STATUS_DOT[contract.status]}`} />
      </div>

      <p className="mt-1 text-body-sm text-gray-600">{subtext}</p>

      <div className="group mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full gradient-trust transition-all duration-500 group-hover:bg-[#06b6d4]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

function SidebarBody() {
  const { contractFilter, setFilter, filteredContracts, openModal } = useAppState();

  return (
    <>
      {/* Header */}
      <div className="flex items-center p-6 pb-4">
        <span className="text-label text-gray-500">Your Contracts</span>
        <button
          type="button"
          aria-label="Create contract"
          onClick={() => openModal({ type: "create-contract" })}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-4 px-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`pb-1 text-label transition-colors ${
              contractFilter === f.key
                ? "border-b-2 border-[#0ea5e9] font-bold text-[#0ea5e9]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 pb-6">
        {filteredContracts.length === 0 ? (
          <p className="px-2 py-8 text-center text-body-sm text-gray-400">
            No contracts in this view.
          </p>
        ) : (
          filteredContracts.map((c) => <ContractCard key={c.id} contract={c} />)
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppState();

  return (
    <>
      {/* Desktop / tablet: in-flow sidebar */}
      <aside className="hidden h-[calc(100vh-4rem)] w-[280px] shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 md:block">
        <SidebarBody />
      </aside>

      {/* Mobile: slide-in overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 top-16 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleSidebar(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.aside
              variants={slideInLeft}
              initial="initial"
              animate="animate"
              exit={{ x: -320, opacity: 0, transition: { duration: 0.25 } }}
              className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto border-r border-gray-200 bg-white"
            >
              <SidebarBody />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
