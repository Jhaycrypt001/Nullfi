import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Bell } from "lucide-react";
import { Logo } from "./Logo";
import { BRAND } from "../config/brand";
import { useAppState } from "../hooks/useAppState";
import { formatAddress } from "../utils/formatting";

const NAV_ITEMS = ["Dashboard", "Contracts", "Treasury", "Analytics"] as const;

export function Navigation() {
  const { notificationCount, walletAddress, isConnected, dispatch, toggleSidebar } =
    useAppState();
  const [active, setActive] = useState<(typeof NAV_ITEMS)[number]>("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-6 md:px-12">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => toggleSidebar()}
            className="group flex h-9 w-9 flex-col items-center justify-center gap-1 md:hidden"
          >
            <span className="h-[2px] w-6 bg-[#111] transition-all group-hover:w-5" />
            <span className="h-[2px] w-6 bg-[#111] transition-all" />
            <span className="h-[2px] w-6 bg-[#111] transition-all group-hover:w-5" />
          </button>

          <a href="#" className="group flex items-center gap-2">
            <Logo />
            <span className="text-label font-bold text-[#111]">{BRAND.name}</span>
          </a>
        </div>

        {/* Center: nav items */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActive(item)}
              className="group relative text-body font-medium text-[#111] transition-colors hover:text-[#0ea5e9]"
            >
              {item}
              <span
                className={`absolute -bottom-[22px] left-0 h-[2px] bg-[#0ea5e9] transition-all duration-300 ${
                  active === item ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Right: search, bell, account */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden items-center gap-2 rounded-lg border border-transparent bg-gray-100 px-4 py-2 transition-colors focus-within:border-[#0ea5e9] focus-within:bg-[#f1f5f9] hover:bg-[#f1f5f9] lg:flex">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Search contracts..."
              className="w-40 bg-transparent text-body-sm text-[#111] placeholder-gray-400 outline-none"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS" })}
            className="group relative flex h-10 w-10 items-center justify-center"
          >
            <Bell size={20} className="text-gray-700 transition-colors group-hover:text-[#0ea5e9]" />
            {notificationCount > 0 && (
              <motion.span
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {notificationCount}
              </motion.span>
            )}
          </button>

          {/* Account menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="Account menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full gradient-trust text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              AL
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                >
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-body-sm font-semibold text-[#111]">alice.sui</p>
                    <p className="font-mono-spec text-[11px] text-gray-500">
                      {isConnected && walletAddress
                        ? formatAddress(walletAddress)
                        : "Not connected"}
                    </p>
                  </div>
                  {["Profile", "Settings"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="block w-full cursor-pointer px-4 py-3 text-left text-body-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({
                        type: isConnected ? "DISCONNECT_WALLET" : "CONNECT_WALLET",
                      });
                      setMenuOpen(false);
                    }}
                    className="block w-full cursor-pointer px-4 py-3 text-left text-body-sm text-gray-700 hover:bg-gray-100"
                  >
                    {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
                  </button>
                  <button
                    type="button"
                    className="block w-full cursor-pointer border-t border-gray-100 px-4 py-3 text-left text-body-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 bg-white md:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setActive(item);
                  setMobileNavOpen(false);
                }}
                className="block w-full px-6 py-3 text-left text-body font-medium text-[#111] hover:bg-gray-50"
              >
                {item}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
