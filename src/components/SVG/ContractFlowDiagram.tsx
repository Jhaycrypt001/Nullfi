import { motion } from "motion/react";
import type { Contract } from "../../types";
import { CONDITION_TONE, TYPE_META, STATUS_TONE } from "../../lib/contractMeta";
import { formatMoney } from "../../utils/formatting";
import { pathDraw } from "../../lib/motion";

/**
 * ContractFlowDiagram
 * Initiator ─▶ Contract Logic (with condition blocks) ─▶ Recipient.
 * Lines draw in (pathLength 0→1), condition blocks cascade in.
 */
export function ContractFlowDiagram({ contract }: { contract: Contract }) {
  const lineColor = STATUS_TONE[contract.status].hex;
  const W = 820;
  const H = 340;

  // node anchor points
  const initiator = { x: 90, y: H / 2 };
  const recipient = { x: W - 90, y: H / 2 };
  const box = { x: 280, y: 70, w: 260, h: 200 };
  const boxCx = box.x + box.w / 2;

  const conds = contract.conditions.slice(0, 4);
  const available = contract.releasedValue;
  const inEscrow = contract.totalValue - contract.releasedValue;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Flow diagram for ${contract.name}`}
    >
      <defs>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={lineColor} floodOpacity="0.35" />
        </filter>
        <linearGradient id="trustGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="escrowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      {/* ── Amount labels ── */}
      <text x={initiator.x} y={initiator.y - 70} textAnchor="middle" className="font-mono-spec" fontSize="13" fontWeight="700" fill="#111">
        Locked
      </text>
      <text x={initiator.x} y={initiator.y - 52} textAnchor="middle" className="font-mono-spec" fontSize="12" fill="#6b7280">
        {formatMoney(contract.totalValue, contract.tokenSymbol).replace(` ${contract.tokenSymbol}`, "")}
      </text>

      <text x={boxCx} y={36} textAnchor="middle" className="font-mono-spec" fontSize="13" fontWeight="700" fill="#8b5cf6">
        In Escrow
      </text>
      <text x={boxCx} y={54} textAnchor="middle" className="font-mono-spec" fontSize="12" fill="#8b5cf6">
        ${inEscrow.toLocaleString()}
      </text>

      <text x={recipient.x} y={recipient.y - 70} textAnchor="middle" className="font-mono-spec" fontSize="13" fontWeight="700" fill="#111">
        Available
      </text>
      <text x={recipient.x} y={recipient.y - 52} textAnchor="middle" className="font-mono-spec" fontSize="12" fill="#6b7280">
        ${available.toLocaleString()}
      </text>

      {/* ── Connecting lines (animated draw) ── */}
      <motion.path
        d={`M ${initiator.x + 38} ${initiator.y} H ${box.x}`}
        stroke={lineColor}
        strokeWidth="2"
        strokeDasharray="6 6"
        fill="none"
        variants={pathDraw}
        initial="initial"
        animate="animate"
      />
      <motion.path
        d={`M ${box.x + box.w} ${recipient.y} H ${recipient.x - 38}`}
        stroke={lineColor}
        strokeWidth="2"
        strokeDasharray="6 6"
        fill="none"
        variants={pathDraw}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      />

      {/* ── Initiator node ── */}
      <g filter="url(#nodeGlow)">
        <circle cx={initiator.x} cy={initiator.y} r="34" fill="url(#trustGrad)" />
      </g>
      <text x={initiator.x} y={initiator.y + 6} textAnchor="middle" fontSize="22" fill="#fff" fontWeight="700">
        {contract.initiatorName.charAt(0).toUpperCase()}
      </text>
      <text x={initiator.x} y={initiator.y + 60} textAnchor="middle" fontSize="13" fill="#111" fontWeight="600">
        {contract.initiatorName}
      </text>

      {/* ── Recipient node ── */}
      <g filter="url(#nodeGlow)">
        <circle cx={recipient.x} cy={recipient.y} r="34" fill="url(#escrowGrad)" />
      </g>
      <text x={recipient.x} y={recipient.y + 6} textAnchor="middle" fontSize="22" fill="#fff" fontWeight="700">
        {contract.recipientName.charAt(0).toUpperCase()}
      </text>
      <text x={recipient.x} y={recipient.y + 60} textAnchor="middle" fontSize="13" fill="#111" fontWeight="600">
        {contract.recipientName}
      </text>

      {/* ── Central contract box ── */}
      <g filter="url(#nodeGlow)">
        <rect
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx="14"
          fill="#fff"
          stroke={lineColor}
          strokeWidth="1.5"
        />
      </g>
      <text x={boxCx} y={box.y + 26} textAnchor="middle" className="font-mono-spec" fontSize="11" letterSpacing="0.05em" fill="#6b7280">
        {TYPE_META[contract.type].label.toUpperCase()}
      </text>

      {/* ── Condition blocks (cascade in) ── */}
      {conds.map((c, i) => {
        const tone = CONDITION_TONE[c.status];
        const rowY = box.y + 40 + i * 38;
        const innerW = box.w - 32;
        return (
          <motion.g
            key={c.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: "easeOut" }}
          >
            <rect x={box.x + 16} y={rowY} width={innerW} height="30" rx="7" fill="#f8f9fa" />
            <motion.circle
              cx={box.x + 30}
              cy={rowY + 15}
              r="5"
              fill={tone.hex}
              animate={
                c.status === "pending" || c.status === "at-risk"
                  ? { opacity: [1, 0.4, 1] }
                  : undefined
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            <text x={box.x + 44} y={rowY + 19} fontSize="10.5" fill="#374151" className="font-mono-spec">
              {c.name.length > 24 ? `${c.name.slice(0, 23)}…` : c.name}
            </text>
            {/* mini progress */}
            <rect x={box.x + 16} y={rowY + 26} width={innerW} height="2.5" rx="1.25" fill="#e5e7eb" />
            <rect
              x={box.x + 16}
              y={rowY + 26}
              width={(innerW * c.completionPercent) / 100}
              height="2.5"
              rx="1.25"
              fill={tone.hex}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
