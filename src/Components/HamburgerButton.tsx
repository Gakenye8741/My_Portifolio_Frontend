// src/Features/Components/HamburgerButton.tsx
import React from "react";

export const HamburgerButton = ({
  open,
  onClick,
  primary,
  base,
  text,
}: {
  open: boolean;
  onClick: () => void;
  primary: string;
  base: string;
  text: string;
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="mobile-sidebar"
      className="md:hidden fixed top-[4.5rem] left-3 z-[130] grid place-items-center h-11 w-11 rounded-xl border shadow-lg active:scale-90 hover:-translate-y-0.5 transition-all"
      style={{
        backgroundColor: `${base}f0`,
        borderColor: `${primary}55`,
        color: text,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `0 8px 24px -12px ${primary}88`,
      }}
    >
      <span
        className="relative flex flex-col items-center justify-center w-5 h-5"
        aria-hidden="true"
      >
        {/* Top line */}
        <span
          className="absolute h-[2px] w-full rounded-full transition-all duration-300"
          style={{
            backgroundColor: primary,
            transform: open
              ? "translateY(0) rotate(45deg)"
              : "translateY(-6px) rotate(0deg)",
          }}
        />
        {/* Middle line */}
        <span
          className="absolute h-[2px] w-full rounded-full transition-all duration-200"
          style={{
            backgroundColor: text,
            opacity: open ? 0 : 0.85,
            transform: open ? "scaleX(0)" : "scaleX(1)",
          }}
        />
        {/* Bottom line */}
        <span
          className="absolute h-[2px] w-full rounded-full transition-all duration-300"
          style={{
            backgroundColor: primary,
            transform: open
              ? "translateY(0) rotate(-45deg)"
              : "translateY(6px) rotate(0deg)",
          }}
        />
      </span>
    </button>
  );
};