import React from "react";

export default function SparkLogo({ size = "md", showSubtitle = false, className = "" }) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 4-point star / lightning spark icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
        >
          {/* Spark star shape */}
          <path
            d="M24 2L28.5 17.5L44 22L28.5 26.5L24 42L19.5 26.5L4 22L19.5 17.5L24 2Z"
            fill="currentColor"
          />
          {/* Dynamic lightning cut */}
          <path
            d="M23 8L16 23H24L21 38L32 21H24L26 8H23Z"
            fill="#ffffff"
            fillOpacity="0.9"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight text-white font-heading ${textSizes[size]}`}>
          SPARK
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase mt-0.5">
            Task Management Platform
          </span>
        )}
      </div>
    </div>
  );
}
