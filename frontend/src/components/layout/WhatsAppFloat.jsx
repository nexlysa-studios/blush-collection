import React from "react";
import { useSettings } from "@/context/SettingsContext";
import { waLink } from "@/lib/api";

export default function WhatsAppFloat() {
  const s = useSettings();
  const link = waLink(s.whatsapp_number || "27614045481", "Hi Jules For Her ♡ I'd love to place an order.");
  return (
    <a
      data-testid="whatsapp-float"
      href={link} target="_blank" rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 rounded-full pl-3 pr-4 py-3 bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] btn-lift"
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path fill="currentColor" d="M19.11 17.16c-.26-.13-1.57-.77-1.82-.86s-.42-.13-.6.13-.68.86-.84 1.03-.31.2-.57.07-1.11-.41-2.12-1.31c-.78-.7-1.31-1.56-1.46-1.82s-.02-.4.11-.53c.11-.11.26-.28.39-.42.13-.14.17-.24.26-.4s.04-.31-.02-.44c-.07-.13-.6-1.45-.82-1.98-.21-.51-.43-.44-.6-.44-.16-.01-.34-.01-.52-.01s-.48.07-.73.34-.96.94-.96 2.28.99 2.64 1.13 2.83c.13.18 1.94 2.96 4.7 4.15.66.28 1.17.45 1.57.58.66.21 1.26.18 1.74.11.53-.08 1.57-.64 1.79-1.26.22-.62.22-1.15.16-1.26-.07-.11-.24-.18-.5-.31zm-4.87 6.63h-.01c-1.6 0-3.17-.43-4.53-1.24l-.32-.19-3.36.88.9-3.27-.21-.34c-.89-1.41-1.36-3.04-1.36-4.72 0-4.87 3.97-8.83 8.84-8.83 2.36 0 4.58.92 6.25 2.59a8.77 8.77 0 0 1 2.59 6.25c0 4.87-3.97 8.87-8.79 8.87zm7.53-16.4A10.66 10.66 0 0 0 14.24 4c-5.9 0-10.7 4.8-10.71 10.7 0 1.88.49 3.71 1.42 5.33L3.44 26l6.11-1.6a10.7 10.7 0 0 0 5.11 1.3h.01c5.9 0 10.7-4.8 10.7-10.71 0-2.86-1.11-5.55-3.13-7.6z"/>
      </svg>
      <span className="text-xs font-body tracking-[0.2em] uppercase hidden sm:inline">Chat</span>
    </a>
  );
}
