"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { GlowCard } from "./spotlight-card";

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  sourceType: "organic" | "campaign";
  status: "pre-sale" | "closed" | "lost" | "closing" | "new";
  size: number;
  interest: number[];
  probability: "low" | "mid" | "high";
  lastAction: string;
}

interface LeadsTableProps {
  title?: string;
  leads?: Lead[];
  onLeadAction?: (leadId: string, action: string) => void;
  className?: string;
}

export function LeadsTable({
  title = "Transactions",
  leads: initialLeads = [],
  onLeadAction,
  className = ""
}: LeadsTableProps = {}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleLeadSelection = (leadId: string, selected: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (selected) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const isSelected = (leadId: string) => selectedLeads.has(leadId);
  const isAllSelected = selectedLeads.size === leads.length && leads.length > 0;
  const isIndeterminate = selectedLeads.size > 0 && selectedLeads.size < leads.length;

  const handleLeadAction = (leadId: string, action: string) => {
    if (onLeadAction) {
      onLeadAction(leadId, action);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    const sortedLeads = [...leads].sort((a, b) => {
      const aDate = new Date(a.lastAction === "Engage" ? "2024-09-15" : a.lastAction);
      const bDate = new Date(b.lastAction === "Engage" ? "2024-09-15" : b.lastAction);
      return newOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    });

    setLeads(sortedLeads);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getSourcePill = (source: string, sourceType: "organic" | "campaign") => {
    const isOrganic = sourceType === "organic";

    return (
      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
        isOrganic
          ? "bg-green-900/20 text-green-400 border border-green-800/30"
          : "bg-blue-900/20 text-blue-400 border border-blue-800/30"
      }`}>
        {source}
        {!isOrganic && (
          <span className="ml-1 text-xs opacity-60">↗</span>
        )}
      </div>
    );
  };

  const getStatusPill = (status: Lead["status"]) => {
    const statusConfig = {
      "pre-sale": {
        bg: "bg-orange-900/20",
        text: "text-orange-400",
        border: "border-orange-800/30",
        label: "PRE-SALE"
      },
      "closed": {
        bg: "bg-green-900/20",
        text: "text-green-400",
        border: "border-green-800/30",
        label: "CLOSED"
      },
      "lost": {
        bg: "bg-red-900/20",
        text: "text-red-400",
        border: "border-red-800/30",
        label: "LOST"
      },
      "closing": {
        bg: "bg-blue-900/20",
        text: "text-blue-400",
        border: "border-blue-800/30",
        label: "CLOSING"
      },
      "new": {
        bg: "bg-purple-900/20",
        text: "text-purple-400",
        border: "border-purple-800/30",
        label: "NEW"
      }
    };

    const config = statusConfig[status];
    return (
      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </div>
    );
  };

  const renderSparkline = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const isUpTrend = data[data.length - 1] > data[0];

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 15;
      return `${x},${y}`;
    }).join(' ');

    const upColor = "#22c55e";
    const downColor = "#f87171";

    return (
      <div className="w-16 h-6">
        <svg width="60" height="20" viewBox="0 0 60 20" className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke={isUpTrend ? upColor : downColor}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          <circle
            cx={data.length === 1 ? 30 : ((data.length - 1) / (data.length - 1)) * 60}
            cy={20 - ((data[data.length - 1] - min) / range) * 15}
            r="2"
            fill={isUpTrend ? upColor : downColor}
          />
        </svg>
      </div>
    );
  };

  const getProbabilityIcon = (probability: Lead["probability"]) => {
    const barCount = probability === "low" ? 1 : probability === "mid" ? 2 : 3;
    const probabilityColors = {
      low: "bg-orange-900/20 text-orange-400 border-orange-800/30",
      mid: "bg-yellow-900/20 text-yellow-400 border-yellow-800/30",
      high: "bg-green-900/20 text-green-400 border-green-800/30"
    };

    return (
      <div className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-2 ${probabilityColors[probability]}`}>
        <div className="flex items-end gap-0.5">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-full ${
                bar <= barCount
                  ? "bg-current"
                  : "bg-current/30"
              }`}
              style={{
                height: bar === 1 ? '4px' : bar === 2 ? '8px' : '12px'
              }}
            />
          ))}
        </div>
        <span className="uppercase tracking-wide">
          {probability}
        </span>
      </div>
    );
  };

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      }
    }
  };

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      filter: "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
  };

  if (leads.length === 0) {
    return (
      <div className="w-full text-center py-12 text-gray-500">
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Table Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Table Headers */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-800/30 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-white focus:ring-white/20 focus:ring-2 accent-white bg-gray-900"
              />
            </div>
            <span>Lead</span>
          </div>
          <div>Source</div>
          <div>Status</div>
          <div>Size</div>
          <div>Interest</div>
          <div>Probability</div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleSort}>
            Last Action
            <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Table Rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {leads.map((lead, index) => (
            <motion.div key={lead.id} variants={rowVariants}>
              <GlowCard glowColor="blue">
              <div
                className={`grid grid-cols-7 gap-4 px-6 py-2 transition-colors cursor-pointer group relative ${
                  isSelected(lead.id) ? "bg-blue-900/10" : ""
                }`}
                onMouseEnter={() => {
                  setHoveredRow(lead.id);
                  setHoveredAction(lead.id);
                }}
                onMouseLeave={() => {
                  setHoveredRow(null);
                  setHoveredAction(null);
                }}
              >
                {/* Lead Info */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected(lead.id)}
                    onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-white focus:ring-white/20 focus:ring-2 accent-white bg-gray-900"
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700">
                      <span className="text-sm font-medium text-gray-400">
                        {lead.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{lead.name}</div>
                      <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                    </div>
                  </div>
                </div>

                {/* Source */}
                <div className="flex items-center">
                  {getSourcePill(lead.source, lead.sourceType)}
                </div>

                {/* Status */}
                <div className="flex items-center">
                  {getStatusPill(lead.status)}
                </div>

                {/* Size */}
                <div className="flex items-center">
                  <span className="font-semibold text-white">
                    {formatCurrency(lead.size)}
                  </span>
                </div>

                {/* Interest */}
                <div className="flex items-center">
                  {renderSparkline(lead.interest)}
                </div>

                {/* Probability */}
                <div className="flex items-center">
                  {getProbabilityIcon(lead.probability)}
                </div>

                {/* Last Action */}
                <div className="flex items-center">
                  <AnimatePresence mode="wait">
                    {hoveredAction === lead.id ? (
                      <motion.button
                        initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                          duration: 0.1
                        }}
                        onClick={() => handleLeadAction(lead.id, "engage")}
                        className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        Engage
                        <div className="w-px h-3 bg-blue-500/30 mx-1" />
                        <MoreHorizontal className="w-3 h-3" />
                      </motion.button>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.05 }}
                        className="text-xs text-gray-500"
                      >
                        {lead.lastAction}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
