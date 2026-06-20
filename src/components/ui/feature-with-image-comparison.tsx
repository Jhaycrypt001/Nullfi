import { useState } from "react";
import { GripVertical } from "lucide-react";

function Feature() {
  const [inset, setInset] = useState<number>(50);
  const [onMouseDown, setOnMouseDown] = useState<boolean>(false);

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onMouseDown) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;

    if ("touches" in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
    } else if ("clientX" in e) {
      x = e.clientX - rect.left;
    }

    const percentage = (x / rect.width) * 100;
    setInset(percentage);
  };

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400">
              Features
            </span>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-2xl md:text-3xl tracking-tighter lg:max-w-xl font-regular">
              Deploy on Sui
            </h2>
            <p className="text-base max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-gray-400">
              Drag to compare development workflow before and after using Nullfi
            </p>
          </div>
          <div className="pt-8 w-full max-w-4xl">
            <div
              className="relative w-full bg-gray-900 rounded-2xl overflow-hidden select-none cursor-ew-resize"
              style={{ aspectRatio: "16/9" }}
              onMouseMove={onMouseMove}
              onMouseUp={() => setOnMouseDown(false)}
              onMouseLeave={() => setOnMouseDown(false)}
              onTouchMove={onMouseMove}
              onTouchEnd={() => setOnMouseDown(false)}
            >
              {/* Base image - Before */}
              <img
                src="https://images.unsplash.com/photo-1781621707645-e102e87aeb6a?q=80&w=1200&auto=format&fit=crop"
                alt="Before - Development"
                className="w-full h-full object-cover"
              />

              {/* Overlay image with clip - After */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - inset}% 0 0)`,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1781621707775-2a7119129a04?q=80&w=1200&auto=format&fit=crop"
                  alt="After - Analytics"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Divider line and handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white/30 z-20 transition-none"
                style={{
                  left: inset + "%",
                }}
              >
                <button
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/40 hover:bg-white/60 rounded-lg p-2 z-30 transition-all"
                  onMouseDown={(e) => {
                    setOnMouseDown(true);
                    onMouseMove(e);
                  }}
                  onTouchStart={(e) => {
                    setOnMouseDown(true);
                    onMouseMove(e);
                  }}
                >
                  <GripVertical className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
