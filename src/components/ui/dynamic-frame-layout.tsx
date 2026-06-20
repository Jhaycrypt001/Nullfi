"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { BlurFade } from "./blur-fade";

interface Frame {
  id: number;
  video: string;
  defaultPos: { x: number; y: number; w: number; h: number };
}

interface DynamicFrameLayoutProps {
  frames: Frame[];
  className?: string;
  title?: string;
  description?: string;
}

export function DynamicFrameLayout({
  frames,
  className = "",
  title = "See It In Action",
  description = "Explore our platform with interactive video walkthroughs",
}: DynamicFrameLayoutProps) {
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  const getRowSizes = () => {
    if (hovered === null) return "1fr 1fr 1fr";
    const { row } = hovered;
    const nonHoveredSize = (12 - 6) / 2;
    return [0, 1, 2]
      .map((r) => (r === row ? `6fr` : `${nonHoveredSize}fr`))
      .join(" ");
  };

  const getColSizes = () => {
    if (hovered === null) return "1fr 1fr 1fr";
    const { col } = hovered;
    const nonHoveredSize = (12 - 6) / 2;
    return [0, 1, 2]
      .map((c) => (c === col ? `6fr` : `${nonHoveredSize}fr`))
      .join(" ");
  };

  const getTransformOrigin = (x: number, y: number) => {
    const vertical = y === 0 ? "top" : y === 4 ? "center" : "bottom";
    const horizontal = x === 0 ? "left" : x === 4 ? "center" : "right";
    return `${vertical} ${horizontal}`;
  };

  return (
    <section className={`py-20 md:py-32 px-4 md:px-8 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <BlurFade delay={0.2} inView>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-400">{description}</p>
          </div>
        </BlurFade>

        <div
          className="relative w-full rounded-3xl overflow-hidden bg-black/50 border border-white/10"
          style={{
            display: "grid",
            gridTemplateRows: getRowSizes(),
            gridTemplateColumns: getColSizes(),
            gap: "8px",
            padding: "8px",
            minHeight: "600px",
            transition: "grid-template-rows 0.4s ease, grid-template-columns 0.4s ease",
          }}
        >
          {frames.map((frame) => {
            const row = Math.floor(frame.defaultPos.y / 4);
            const col = Math.floor(frame.defaultPos.x / 4);
            const transformOrigin = getTransformOrigin(frame.defaultPos.x, frame.defaultPos.y);

            return (
              <motion.div
                key={frame.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  transformOrigin,
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={() => setHovered({ row, col })}
                onMouseLeave={() => setHovered(null)}
              >
                <video
                  src={frame.video}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />

                {/* Overlay on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity:
                      hovered?.row === row && hovered?.col === col ? 1 : 0,
                  }}
                  className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">▶</div>
                    <p className="text-sm font-medium">Click to play</p>
                  </div>
                </motion.div>

                {/* Border highlight */}
                <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/50 rounded-2xl transition-colors pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
