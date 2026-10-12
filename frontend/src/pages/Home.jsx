import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import ProductCard from "@/components/ProductCard";
import { Divider, Sparkle } from "@/components/Motifs";
import { ArrowRight, Instagram, Sparkles, Truck, Heart, ShoppingBag } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1613966561243-c6959a886009?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwYWVzdGhldGljJTIwZWRpdG9yaWFsfGVufDB8fHx8MTc4ODQzNzkwMnww&ixlib=rb-4.1.0&q=85";
const PROMO_IMG = "https://images.unsplash.com/photo-1616294099799-dab525ec05c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxuZWNrbGFjZSUyMG9uJTIwd29tYW4lMjBqZXdlbHJ5fGVufDB8fHx8MTc4ODQzNzkwMnww&ixlib=rb-4.1.0&q=85";

const INSTA = [
  "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620656798932-902f8b1585b7?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603561591406-cf8f2fda27a2?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1635767798638-3665a0a107b8?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=700&q=80&auto=format&fit=crop",
];

export default function Home() {
  const s = useSettings();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get("/products", { params: { featured: true } }).then((r) => setProducts(r.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-8 sm:pt-14 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 animate-fade-up" data-testid="hero-content">
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62] mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#DCAEAF]"></span> Cape Town · Est. Jules For Her
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-[#2E1C1E]">
              Jewellery <span className="font-script text-[#DCAEAF] italic">made</span><br/>for her.
            </h1>
            <p className="mt-6 text-[15px] sm:text-base text-[#6b4c50] max-w-md leading-relaxed">
              Delicate pieces, everyday sparkle and timeless styles — made to elevate every look.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/shop" data-testid="hero-shop-btn" className="btn-lift inline-flex items-center justify-center gap-2 bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase hover:bg-[#3E1E23]">
                Shop Jewellery <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link to="/shop?category=necklaces" data-testid="hero-explore-btn" className="btn-lift inline-flex items-center justify-center bg-[#FADADD] text-[#592C32] hover:bg-[#DCAEAF] hover:text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase">
                Explore Collection
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-[11px] tracking-[0.25em] uppercase text-[#8a5c62]">
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Affordable Luxury</div>
              <div className="hidden sm:flex items-center gap-2"><Truck className="h-3.5 w-3.5" strokeWidth={1.5} /> Cape Town Delivery</div>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] w-full overflow-hidden rounded-md animate-fade-in">
              <img src={HERO_IMG} alt="Woman wearing delicate gold jewellery" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-6 bottom-6 bg-white/85 backdrop-blur-sm rounded-md px-5 py-4 max-w-sm">
                <div className="text-[10px] tracking-[0.35em] uppercase text-[#8a5c62]">This Season</div>
                <div className="font-serif text-2xl text-[#2E1C1E] mt-1">Soft, layered, quietly luxurious.</div>
              </div>
            </div>
            <Sparkle className="hidden lg:block absolute -top-6 -left-6 h-14 w-14 text-[#DCAEAF]" />
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24" data-testid="shop-by-category">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Shop by category</div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Every piece, chosen with love.</h2>
          </div>
          <Link to="/shop" className="text-xs tracking-[0.3em] uppercase text-[#592C32] hover:text-[#DCAEAF]">View all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((c, i) => (
            <Link
              key={c.id} to={`/shop?category=${c.slug}`}
              data-testid={`category-${c.slug}`}
              className={`group relative block overflow-hidden rounded-md ${i === 0 ? "col-span-2 lg:col-span-2 aspect-[4/5]" : "aspect-[3/4]"}`}
            >
              <img src={c.image_url} alt={c.name} loading="lazy" className="product-img absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E1C1E]/60 via-transparent to-transparent"></div>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <div className="text-[10px] tracking-[0.35em] uppercase opacity-90">From R{c.starting_price}</div>
                <div className="font-serif text-2xl sm:text-3xl mt-1">{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HER FAVOURITES */}
      <section className="bg-[#FDF6F5]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24" data-testid="her-favourites">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Best sellers</div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Her Favourites</h2>
            <Divider className="mt-4" />
            <p className="text-sm text-[#6b4c50] mt-3">The pieces she keeps reaching for.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-12 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23]">Shop All <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      {/* SOMETHING FOR EVERY LOOK - price tiers */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Starting prices</div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Something for every look.</h2>
            <p className="mt-4 text-sm text-[#6b4c50] max-w-sm">A little sparkle, whatever your budget. All pieces are hand-picked and available while stocks last.</p>
          </div>
          <div className="lg:col-span-8 relative">
            <div className="border border-[#EFD9D9] rounded-md p-8 sm:p-12 bg-white">
              <ul className="divide-y divide-[#F1E4E4]">
                {categories.map((c) => (
                  <li key={c.id} className="py-4 flex items-baseline justify-between gap-4">
                    <Link to={`/shop?category=${c.slug}`} className="font-serif text-2xl sm:text-3xl text-[#2E1C1E] hover:text-[#DCAEAF]">{c.name}</Link>
                    <span className="hidden sm:block flex-1 border-b border-dotted border-[#DCAEAF]/50 mx-6 translate-y-[-6px]"></span>
                    <span className="font-serif text-2xl sm:text-3xl text-[#592C32]">from R{c.starting_price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-md">
          <img src={PROMO_IMG} alt="Delicate necklace on woman" className="w-full h-[420px] sm:h-[520px] object-cover" />
          <div className="absolute inset-0 bg-[#2E1C1E]/25"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 sm:px-10">
              <div className="max-w-xl text-white">
                <div className="font-script text-3xl sm:text-4xl italic mb-2">Little details.</div>
                <h2 className="font-serif text-4xl sm:text-6xl leading-[1.05]">Big difference.</h2>
                <p className="mt-4 text-sm sm:text-base text-white/90 max-w-md">Complete your look with jewellery designed to make every outfit feel a little more special.</p>
                <Link to="/shop" className="mt-6 inline-flex items-center gap-2 bg-white text-[#592C32] px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#FADADD]">Shop The Collection <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT snippet */}
      <section className="bg-[#FDF6F5]">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 py-16 sm:py-24 text-center">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">About Jules For Her</div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-3">{s.about_headline || "Made For Her, Chosen By Her."}</h2>
          <Divider className="mt-5" />
          <p className="mt-6 text-[15px] sm:text-lg text-[#6b4c50] leading-relaxed max-w-3xl mx-auto">{s.about_text}</p>
          <Link to="/about" className="mt-8 inline-block text-xs tracking-[0.3em] uppercase text-[#592C32] border-b border-[#592C32] pb-1 hover:border-[#DCAEAF] hover:text-[#DCAEAF]">Our Story</Link>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Why Jules For Her</div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Softly considered. Always kind.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {[
            { icon: Sparkles, title: "Affordable Luxury", text: "Beautiful jewellery without the luxury price tag." },
            { icon: Truck, title: "Cape Town Delivery", text: "Convenient delivery options throughout Cape Town." },
            { icon: Heart, title: "Made To Style", text: "Pieces designed to complement everyday and special." },
            { icon: ShoppingBag, title: "Easy Ordering", text: "Simple online shopping or a quick WhatsApp order." },
          ].map((f, i) => (
            <div key={i} className="text-center px-2">
              <f.icon className="mx-auto h-6 w-6 text-[#DCAEAF]" strokeWidth={1.2} />
              <div className="mt-4 text-[11px] tracking-[0.3em] uppercase text-[#592C32]">{f.title}</div>
              <p className="mt-3 text-sm text-[#6b4c50] leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="bg-[#FDF6F5]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-16 sm:py-24" data-testid="instagram-section">
          <div className="text-center mb-10">
            <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">@{s.instagram_handle || "julesforher_"}</div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Follow Her Style</h2>
            <p className="mt-3 text-sm text-[#6b4c50]">See how our pieces are styled.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {INSTA.map((src, i) => (
              <a key={i} href={`https://instagram.com/${s.instagram_handle || "julesforher_"}`} target="_blank" rel="noreferrer" className="group aspect-square overflow-hidden rounded-sm block">
                <img src={src} alt="Jules For Her styled piece" loading="lazy" className="product-img w-full h-full object-cover" />
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href={`https://instagram.com/${s.instagram_handle || "julesforher_"}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23]">
              <Instagram className="h-4 w-4" strokeWidth={1.5} /> Follow On Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
