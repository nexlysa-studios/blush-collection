import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronDown } from "lucide-react";
import { Divider } from "@/components/Motifs";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(0);
  useEffect(() => { api.get("/faqs").then((r) => setFaqs(r.data)).catch(() => {}); }, []);
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Helpful bits</div>
        <h1 className="font-serif text-5xl sm:text-6xl text-[#2E1C1E] mt-2">FAQ</h1>
        <Divider className="mt-6" />
      </div>
      <div className="mt-10 divide-y divide-[#EFD9D9] border-t border-b border-[#EFD9D9]" data-testid="faq-list">
        {faqs.map((f, i) => (
          <div key={f.id}>
            <button onClick={() => setOpen(open === i ? -1 : i)} data-testid={`faq-q-${i}`} className="w-full flex items-center justify-between py-5 text-left">
              <span className="font-serif text-lg sm:text-xl text-[#2E1C1E]">{f.question}</span>
              <ChevronDown className={`h-5 w-5 text-[#592C32] transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} strokeWidth={1.4} />
            </button>
            {open === i && <div className="pb-5 pr-8 text-[15px] text-[#6b4c50] leading-relaxed" data-testid={`faq-a-${i}`}>{f.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
