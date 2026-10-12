import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const CATS = [
  { slug: "all", name: "All" },
  { slug: "necklaces", name: "Necklaces" },
  { slug: "anklets", name: "Anklets" },
  { slug: "rings", name: "Rings" },
  { slug: "earrings", name: "Earrings" },
  { slug: "bracelets", name: "Bracelets" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [priceMax, setPriceMax] = useState(500);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("featured");

  const category = (params.get("category") || "all").toLowerCase();
  const q = params.get("q") || "";

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (priceMax) list = list.filter((p) => p.price <= priceMax);
    if (inStock) list = list.filter((p) => !p.sold_out && p.stock > 0);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest") list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, priceMax, inStock, sort, q]);

  const setCat = (c) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("category"); else next.set("category", c);
    setParams(next);
  };

  return (
    <div>
      {/* Header */}
      <section className="border-b border-[#EFE3E1] bg-cream">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-12 pb-8 text-center">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">The Collection</div>
          <h1 className="font-serif text-5xl sm:text-6xl text-[#2E1C1E] mt-2">Shop Jewellery</h1>
          <p className="mt-3 text-sm text-[#6b4c50]">Every piece delicately chosen for her.</p>
        </div>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {CATS.map((c) => (
            <button
              key={c.slug} onClick={() => setCat(c.slug)}
              data-testid={`filter-${c.slug}`}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] tracking-[0.3em] uppercase btn-lift border ${
                category === c.slug ? "bg-[#592C32] text-white border-[#592C32]" : "bg-transparent text-[#592C32] border-[#EFD9D9] hover:border-[#DCAEAF]"
              }`}
            >{c.name}</button>
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-12 grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-3">Filter</div>
          <div className="border border-[#EFD9D9] rounded-md p-5 space-y-6 bg-white">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase text-[#592C32] mb-3">Max Price</div>
              <input type="range" min="45" max="500" step="5" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-[#592C32]" data-testid="filter-price" />
              <div className="mt-2 text-sm font-serif text-[#2E1C1E]">Up to R{priceMax}</div>
            </div>
            <label className="flex items-center gap-3 text-sm text-[#3E1E23] cursor-pointer">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} data-testid="filter-instock" className="accent-[#592C32]" />
              In stock only
            </label>
          </div>
          <div className="mt-8">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-3">Sort</div>
            <select
              value={sort} onChange={(e) => setSort(e.target.value)}
              data-testid="sort-select"
              className="w-full bg-white border border-[#EFD9D9] rounded-md px-3 py-2.5 text-sm text-[#2E1C1E] focus:outline-none focus:border-[#592C32]"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="flex items-baseline justify-between mb-6">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62]">{filtered.length} pieces</div>
            {q && <div className="text-xs text-[#6b4c50]">Search: “{q}”</div>}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-24 font-serif text-2xl text-[#8a5c62]">No pieces match that yet. Try another filter.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14" data-testid="products-grid">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
