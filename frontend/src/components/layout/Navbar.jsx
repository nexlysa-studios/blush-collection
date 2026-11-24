import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count } = useCart();
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false); setOpen(false); setQ("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-[#EFE3E1]" data-testid="site-navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <button
          data-testid="mobile-menu-toggle"
          aria-label="Open menu"
          className="md:hidden p-2 -ml-2 text-[#592C32]"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" strokeWidth={1.4} />
        </button>

        <Link to="/" data-testid="brand-logo" className="md:mr-8 flex-shrink-0 flex flex-col items-center md:items-start leading-none">
          <span className="font-brittany text-4xl sm:text-5xl text-[#592C32] leading-none">Jules For Her</span>
          <span className="hidden sm:block mt-0.5 text-[10px] tracking-[0.4em] uppercase text-[#8a5c62] font-body">Cape Town</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.22em] uppercase font-body">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `relative py-1 hover:text-[#592C32] btn-lift ${isActive ? "text-[#592C32]" : "text-[#6b4c50]"}`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-[#592C32]"></span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5 text-[#592C32]">
          <button
            data-testid="nav-search"
            aria-label="Search"
            className="hidden sm:inline-flex p-2 hover:opacity-70"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-4.5 w-4.5" strokeWidth={1.4} />
          </button>
          <Link to="/admin/login" data-testid="nav-account" aria-label="Admin" className="hidden sm:inline-flex p-2 hover:opacity-70">
            <User className="h-4.5 w-4.5" strokeWidth={1.4} />
          </Link>
          <Link to="/cart" data-testid="nav-cart" aria-label="Cart" className="relative p-2 hover:opacity-70">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
            {count > 0 && (
              <span data-testid="cart-count" className="absolute -top-0.5 -right-0.5 bg-[#592C32] text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-body">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-[#EFE3E1] bg-cream">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <input
              autoFocus data-testid="search-input"
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search necklaces, rings, bracelets…"
              className="w-full bg-transparent border-b border-[#DCAEAF] py-2 text-base font-serif placeholder:text-[#b28b90] focus:outline-none focus:border-[#592C32]"
            />
          </div>
        </form>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" data-testid="mobile-menu">
          <div className="absolute inset-0 bg-[#2E1C1E]/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[82%] max-w-sm bg-cream flex flex-col animate-fade-in">
            <div className="p-5 flex items-center justify-between border-b border-[#EFE3E1]">
              <span className="font-brittany text-4xl text-[#592C32] leading-none">Jules For Her</span>
              <button data-testid="mobile-menu-close" onClick={() => setOpen(false)} className="p-2"><X className="h-5 w-5" strokeWidth={1.4} /></button>
            </div>
            <nav className="p-6 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to} to={l.to} onClick={() => setOpen(false)}
                  data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                  className="py-3 border-b border-[#EFE3E1] font-serif text-2xl text-[#592C32]"
                >{l.label}</NavLink>
              ))}
              <NavLink to="/faq" onClick={() => setOpen(false)} className="py-3 border-b border-[#EFE3E1] font-serif text-2xl text-[#592C32]">FAQ</NavLink>
              <NavLink to="/admin/login" onClick={() => setOpen(false)} className="py-3 font-body text-xs tracking-[0.3em] uppercase text-[#8a5c62]">Admin</NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
