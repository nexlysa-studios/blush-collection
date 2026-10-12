import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";
import { Divider } from "@/components/Motifs";
import { Sparkles, Truck, Heart, ShoppingBag } from "lucide-react";

export default function About() {
  const s = useSettings();
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-16 pb-8 text-center">
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Our story</div>
          <h1 className="font-serif text-5xl sm:text-7xl text-[#2E1C1E] mt-3">{s.about_headline || "Made For Her, Chosen By Her."}</h1>
          <Divider className="mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 sm:px-10 py-10">
        <p className="text-lg sm:text-xl leading-relaxed text-[#3E1E23] font-serif">{s.about_text}</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <img src="https://images.unsplash.com/photo-1616294099799-dab525ec05c1?w=1200&q=80&auto=format&fit=crop" alt="Delicate necklace styled on model" className="rounded-md aspect-[4/5] object-cover w-full" />
        <div>
          <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Handpicked in Cape Town</div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2">Little pieces, chosen with intention.</h2>
          <p className="mt-6 text-[#6b4c50] leading-relaxed">From tiny huggie hoops to layering chains, every piece at Jules For Her is chosen for the woman who loves the quiet detail. Not shouting. Just softly there — the finishing touch on your everyday.</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            {[
              { icon: Sparkles, title: "Affordable Luxury" },
              { icon: Truck, title: "Cape Town Delivery" },
              { icon: Heart, title: "Made To Style" },
              { icon: ShoppingBag, title: "Easy Ordering" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <f.icon className="h-5 w-5 text-[#DCAEAF] mt-0.5" strokeWidth={1.3} />
                <div className="text-[11px] tracking-[0.3em] uppercase text-[#592C32]">{f.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FDF6F5] py-16 text-center">
        <div className="font-script text-4xl text-[#DCAEAF]">Little details. Big difference.</div>
        <Link to="/shop" className="mt-6 inline-block bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Shop The Collection</Link>
      </section>
    </div>
  );
}
