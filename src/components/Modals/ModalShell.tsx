import { useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { modalScale } from "../../lib/motion";

interface Props {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  labelledBy?: string;
}

/** Backdrop + centered, scale-in modal card. Closes on backdrop click & Esc. */
export function ModalShell({
  onClose,
  children,
  maxWidth = "600px",
  labelledBy,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        variants={modalScale}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
        className="relative max-h-[90vh] w-[90vw] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
