import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Music2, MessageCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const s = useSettings();
  return (
    <footer className="mt-20 border-t border-[#EFE3E1] bg-[#FDF6F5]" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-script text-3xl text-[#592C32]">Jules For Her</div>
          <p className="mt-3 text-sm text-[#6b4c50] leading-relaxed max-w-xs">Delicate jewellery for everyday sparkle — thoughtfully curated in Cape Town.</p>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-4">Shop</div>
          <ul className="space-y-2 text-sm text-[#3E1E23]">
            <li><Link to="/shop?category=necklaces" className="hover:text-[#DCAEAF]">Necklaces</Link></li>
            <li><Link to="/shop?category=anklets" className="hover:text-[#DCAEAF]">Anklets</Link></li>
            <li><Link to="/shop?category=rings" className="hover:text-[#DCAEAF]">Rings</Link></li>
            <li><Link to="/shop?category=earrings" className="hover:text-[#DCAEAF]">Earrings</Link></li>
            <li><Link to="/shop?category=bracelets" className="hover:text-[#DCAEAF]">Bracelets</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-4">Help</div>
          <ul className="space-y-2 text-sm text-[#3E1E23]">
            <li><Link to="/about" className="hover:text-[#DCAEAF]">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-[#DCAEAF]">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-[#DCAEAF]">FAQ</Link></li>
            <li><Link to="/admin/login" className="hover:text-[#DCAEAF]">Admin</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-4">Elsewhere</div>
          <ul className="space-y-3 text-sm text-[#3E1E23]">
            <li><a href={`https://instagram.com/${s.instagram_handle || "julesforher_"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#DCAEAF]"><Instagram className="h-4 w-4" strokeWidth={1.5} /> @{s.instagram_handle || "julesforher_"}</a></li>
            <li><a href={`https://www.tiktok.com/@${s.tiktok_handle || "julesforher_"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#DCAEAF]"><Music2 className="h-4 w-4" strokeWidth={1.5} /> @{s.tiktok_handle || "julesforher_"}</a></li>
            <li><a href={`https://wa.me/${s.whatsapp_number || "27614045481"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#DCAEAF]"><MessageCircle className="h-4 w-4" strokeWidth={1.5} /> 061 404 5481</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#EFE3E1]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8a5c62]">
          <div>© {new Date().getFullYear()} Jules For Her. Made with love in Cape Town.</div>
          <div className="font-script text-lg text-[#DCAEAF]">Little details. Big difference.</div>
        </div>
      </div>
    </footer>
  );
}
