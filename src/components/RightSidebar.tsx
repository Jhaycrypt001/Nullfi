import { motion } from "motion/react";
import {
  CheckCircle,
  AlertCircle,
  Zap,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useAppState } from "../hooks/useAppState";
import { formatRelative } from "../utils/formatting";
import { fadeUp, staggerContainer } from "../lib/motion";
import { TimeCountdown } from "./SVG/TimeCountdown";
import type { ActivityType, AlertLevel } from "../types";

const ACTIVITY_ICON: Record<ActivityType, { icon: LucideIcon; cls: string }> = {
  condition_met: { icon: CheckCircle, cls: "text-[#10b981]" },
  condition_failed: { icon: AlertCircle, cls: "text-[#ef4444]" },
  execution: { icon: Zap, cls: "text-[#0ea5e9]" },
  alert: { icon: AlertCircle, cls: "text-[#f59e0b]" },
};

const sparkData = [
  { v: 88 }, { v: 90 }, { v: 87 }, { v: 92 },
  { v: 91 }, { v: 95 }, { v: 93 }, { v: 94 },
];

const ALERT_STYLE: Record<
  AlertLevel,
  { wrap: string; text: string; icon: LucideIcon; iconCls: string }
> = {
  critical: {
    wrap: "bg-red-100 border border-red-300",
    text: "text-red-900",
    icon: AlertTriangle,
    iconCls: "text-[#ef4444]",
  },
  warning: {
    wrap: "bg-amber-100 border border-amber-300",
    text: "text-amber-900",
    icon: AlertCircle,
    iconCls: "text-[#f59e0b]",
  },
  info: {
    wrap: "bg-blue-100 border border-blue-300",
    text: "text-blue-900",
    icon: Info,
    iconCls: "text-[#0ea5e9]",
  },
};

function QuickStat({
  label,
  value,
  valueCls,
  metricCls,
  metric,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  valueCls?: string;
  metric?: string;
  metricCls?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-label text-gray-500">{label}</p>
      {value !== undefined && (
        <p className={`text-heading-lg font-bold ${valueCls ?? "text-[#111]"}`}>{value}</p>
      )}
      {children}
      {metric && <p className={`text-label mt-1 ${metricCls ?? "text-gray-500"}`}>{metric}</p>}
    </div>
  );
}

export function RightSidebar() {
  const { liveActivityFeed, alerts, selectedContract } = useAppState();

  const met = selectedContract?.conditions.filter((c) => c.status === "met").length ?? 0;
  const total = selectedContract?.conditions.length ?? 0;
  const atRisk = selectedContract?.totalValue ?? 0;

  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-[320px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50 lg:flex">
      {/* Live Activity */}
      <div className="border-b border-gray-200 p-6 pb-4">
        <h3 className="text-heading-md text-[#111]">Live Activity</h3>
      </div>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="initial"
        animate="animate"
      >
        {liveActivityFeed.map((a) => {
          const { icon: Icon, cls } = ACTIVITY_ICON[a.type];
          return (
            <motion.div
              key={a.id}
              variants={fadeUp}
              className="flex gap-3 border-b border-gray-100 px-6 py-4 transition-colors hover:bg-gray-100"
            >
              <Icon size={16} className={`mt-0.5 shrink-0 ${cls}`} />
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-[#111]">{a.title}</p>
                <p className="mt-1 text-body-sm text-gray-600">{a.description}</p>
                <p className="text-label mt-1 text-gray-500">
                  {formatRelative(a.timestamp)} · by {a.actor}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Stats */}
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-heading-md mb-4 text-[#111]">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <QuickStat
            label="Value at Risk"
            value={`$${atRisk.toLocaleString()}`}
            valueCls="text-[#f59e0b]"
            metric="exposure"
            metricCls="text-amber-600"
          />
          <QuickStat
            label="Conditions Met"
            value={`${met}/${total}`}
            valueCls="text-[#10b981]"
            metric="on track"
            metricCls="text-green-600"
          />
          <QuickStat label="Time Remaining" metric="counting down" metricCls="text-blue-600">
            <p className="text-heading-md font-bold text-[#0ea5e9]">
              {selectedContract?.nextTrigger ? (
                <TimeCountdown target={selectedContract.nextTrigger} withSeconds={false} />
              ) : (
                "—"
              )}
            </p>
          </QuickStat>
          <QuickStat label="Avg Completion" value="94%">
            <div className="mt-1 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </QuickStat>
        </div>
      </div>

      {/* Alerts */}
      <div className="border-b border-gray-200 p-6 pb-2">
        <h3 className="text-heading-md text-[#111]">Alerts</h3>
      </div>
      <div className="px-4 py-2 pb-6">
        {alerts.map((al) => {
          const s = ALERT_STYLE[al.level];
          const Icon = s.icon;
          return (
            <div key={al.id} className={`mb-3 flex gap-2 rounded-lg p-3 ${s.wrap}`}>
              <Icon size={16} className={`mt-0.5 shrink-0 ${s.iconCls}`} />
              <p className={`text-body-sm font-medium ${s.text}`}>{al.message}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
