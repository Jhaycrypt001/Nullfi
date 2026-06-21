"use client";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { ConnectButton } from "@suiet/wallet-kit";

function NavHeader() {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center justify-center w-full px-4 md:px-8 py-4 relative">
      {/* Logo - Left */}
      <div className="absolute left-4 md:left-8 flex items-center gap-2">
        <img
          src="/assets/nullfi-logo.svg"
          alt="Nullfi Logo"
          className="w-8 h-8 md:w-10 md:h-10"
        />
        <span className="text-lg md:text-xl font-bold text-white">Nullfi</span>
      </div>

      {/* Nav Tabs - Center */}
      <ul
        className="relative flex w-fit rounded-full border-2 border-white/20 bg-black/50 p-1"
        onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      >
        <Tab setPosition={setPosition} href="/">Home</Tab>
        <Tab setPosition={setPosition} href="#features">Features</Tab>
        <Tab setPosition={setPosition} href="/docs">Docs</Tab>
        <Tab setPosition={setPosition} href="#community">Community</Tab>
        <Tab setPosition={setPosition} href="#contact">Contact</Tab>
        <Cursor position={position} />
      </ul>

      {/* Auth Buttons - Absolute Right */}
      <div className="absolute right-4 md:right-8 flex gap-3 items-center">
        {isAuthenticated ? (
          <>
            <a
              href="/dashboard"
              className="hidden sm:block px-4 py-2 text-sm text-white hover:text-blue-400 transition"
            >
              Dashboard
            </a>
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition text-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <ConnectButton />
        )}
      </div>
    </div>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
}: {
  children: React.ReactNode;
  setPosition: any;
  href?: string;
}) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={({ currentTarget }) => {
        if (!ref?.current) return;
        const { width } = currentTarget.getBoundingClientRect();
        const { offsetLeft } = currentTarget;
        setPosition({ left: offsetLeft, width, opacity: 1 });
      }}
      className="relative px-4 py-2 cursor-pointer whitespace-nowrap"
    >
      {href ? (
        <a href={href} className="text-white">
          {children}
        </a>
      ) : (
        children
      )}
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => (
  <motion.li
    animate={{ ...position }}
    className="absolute h-7 bg-white rounded-full"
    layout
  />
);

export default NavHeader;
