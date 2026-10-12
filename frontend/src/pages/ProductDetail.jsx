import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, formatZAR, waLink } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import ProductCard from "@/components/ProductCard";
import { Truck, RotateCcw, Sparkles, MessageCircle, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const s = useSettings();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("delivery");

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => {
      setProduct(r.data); setActive(0); setQty(1);
      api.get("/products", { params: { category: r.data.category } }).then((rr) => {
        setRelated(rr.data.filter((p) => p.id !== r.data.id).slice(0, 4));
      });
    }).catch(() => navigate("/shop"));
  }, [slug, navigate]);

  if (!product) return <div className="py-24 text-center font-serif text-2xl text-[#8a5c62]">Loading…</div>;
  const soldOut = product.sold_out || product.stock <= 0;
  const waMsg = `Hi Jules For Her ♡\nI'd like to order:\n• ${product.name} x${qty}\n• ${formatZAR(product.price * qty)}\n\nMy details:`;

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-10 py-10 sm:py-16">
      <nav className="text-xs tracking-[0.25em] uppercase text-[#8a5c62] mb-8">
        <Link to="/" className="hover:text-[#592C32]">Home</Link> / <Link to="/shop" className="hover:text-[#592C32]">Shop</Link> / <span className="text-[#592C32]">{product.name}</span>
      </nav>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#FDF6F5]" data-testid="product-gallery">
            {product.images?.[active] && <img src={product.images[active]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`aspect-square rounded-sm overflow-hidden border ${i === active ? "border-[#592C32]" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] tracking-[0.35em] uppercase text-[#8a5c62]">{product.category}</div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2 leading-tight">{product.name}</h1>
          <div className="mt-4 font-serif text-3xl text-[#592C32]">{formatZAR(product.price)}</div>
          <div className="mt-6 h-px bg-[#EFD9D9]"></div>
          <p className="mt-6 text-[15px] leading-relaxed text-[#6b4c50]">{product.description}</p>
          <div className="mt-6 text-xs tracking-[0.25em] uppercase text-[#8a5c62]">
            {soldOut ? <span className="text-[#B54044]">Sold out</span> : product.stock <= 3 ? <span className="text-[#B54044]">Only {product.stock} left</span> : <span>In stock</span>}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-[#EFD9D9] rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-[#592C32] hover:text-[#DCAEAF]" data-testid="qty-decrease"><Minus className="h-4 w-4" /></button>
              <div className="w-8 text-center font-serif text-lg" data-testid="qty-value">{qty}</div>
              <button onClick={() => setQty(qty + 1)} className="p-3 text-[#592C32] hover:text-[#DCAEAF]" data-testid="qty-increase"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <button
              data-testid="pdp-add-to-cart"
              disabled={soldOut}
              onClick={() => add(product, qty)}
              className="btn-lift bg-[#592C32] text-white hover:bg-[#3E1E23] rounded-full py-4 text-xs tracking-[0.3em] uppercase disabled:opacity-40"
            >Add To Bag</button>
            <button
              data-testid="pdp-buy-now"
              disabled={soldOut}
              onClick={() => { add(product, qty); navigate("/checkout"); }}
              className="btn-lift bg-[#FADADD] text-[#592C32] hover:bg-[#DCAEAF] hover:text-white rounded-full py-4 text-xs tracking-[0.3em] uppercase disabled:opacity-40"
            >Buy Now</button>
          </div>

          <a
            href={waLink(s.whatsapp_number, waMsg)} target="_blank" rel="noreferrer"
            data-testid="pdp-whatsapp-order"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#1a8a45] hover:bg-[#25D366] hover:text-white rounded-full py-3 text-xs tracking-[0.3em] uppercase btn-lift"
          ><MessageCircle className="h-4 w-4" /> Order Via WhatsApp</a>

          {/* Tabs */}
          <div className="mt-10 border-t border-[#EFD9D9]">
            <div className="flex gap-6 pt-4">
              {[
                { k: "delivery", label: "Delivery", icon: Truck },
                { k: "returns", label: "Returns", icon: RotateCcw },
                { k: "care", label: "Care", icon: Sparkles },
              ].map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={`flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase pb-3 border-b-2 ${tab === t.k ? "border-[#592C32] text-[#592C32]" : "border-transparent text-[#8a5c62]"}`}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
            <div className="py-4 text-sm text-[#6b4c50] leading-relaxed">
              {tab === "delivery" && (s.delivery_info || "Cape Town delivery in 2–4 working days.")}
              {tab === "returns" && (s.returns_info || "Exchanges within 7 days on unworn pieces.")}
              {tab === "care" && (s.care_info || "Keep away from water, perfume and lotion.")}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">You may also love</div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2E1C1E] mt-1 mb-8">Complete Your Look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
