import React from "react";

export function Sparkle({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2zm7 12l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4L19 14zM5 14l.7 2 2 .5-2 .5L5 19l-.7-2-2-.5 2-.5L5 14z"/>
    </svg>
  );
}

export function Bow({ className = "" }) {
  return (
    <svg viewBox="0 0 48 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 12c6-8 14-8 20 0-6 8-14 8-20 0z"/>
      <path d="M44 12c-6-8-14-8-20 0 6 8 14 8 20 0z"/>
      <circle cx="24" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function Divider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 text-[#DCAEAF] ${className}`}>
      <span className="h-px flex-1 max-w-[80px] bg-[#EFD9D9]"></span>
      <Bow className="h-5 w-10" />
      <span className="h-px flex-1 max-w-[80px] bg-[#EFD9D9]"></span>
    </div>
  );
}
