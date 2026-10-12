import React from "react";
import { useSettings } from "@/context/SettingsContext";

export default function AnnouncementBar() {
  const s = useSettings();
  const text = s.announcement || "Cape Town deliveries available  •  Minimum order R100";
  const items = Array.from({ length: 8 }, (_, i) => text);
  return (
    <div data-testid="announcement-bar" className="bg-[#DCAEAF] text-white overflow-hidden">
      <div className="marquee-track py-2 text-[11px] sm:text-xs tracking-[0.28em] uppercase font-body font-light">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{t}</span>
            <span className="opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
