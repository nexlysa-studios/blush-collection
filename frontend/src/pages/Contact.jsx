import React, { useState } from "react";
import { toast } from "sonner";
import { api, waLink } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { MessageCircle, Instagram, Music2, MapPin } from "lucide-react";

export default function Contact() {
  const s = useSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const input = "w-full bg-transparent border-b border-[#EFD9D9] py-3 text-[15px] focus:outline-none focus:border-[#592C32] placeholder:text-[#b28b90]";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent — we'll be in touch ♡");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch { toast.error("Couldn't send message. Please try WhatsApp."); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Get in touch</div>
        <h1 className="font-serif text-5xl sm:text-6xl text-[#2E1C1E] mt-2">Let's Chat.</h1>
        <p className="mt-3 text-[#6b4c50]">For orders, styling questions or a warm hello — we'd love to hear from you.</p>
      </div>

      <div className="mt-14 grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62]">Jules For Her</div>
            <div className="font-serif text-3xl text-[#2E1C1E] mt-1">Cape Town, South Africa</div>
          </div>
          <div className="space-y-4 text-sm text-[#3E1E23]">
            <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-[#DCAEAF] mt-0.5" strokeWidth={1.5} /> Retreat • Lotus River • Kuils River</div>
            <div className="flex items-start gap-3"><MessageCircle className="h-4 w-4 text-[#DCAEAF] mt-0.5" strokeWidth={1.5} /> 061 404 5481 (WhatsApp)</div>
            <div className="flex items-start gap-3"><Instagram className="h-4 w-4 text-[#DCAEAF] mt-0.5" strokeWidth={1.5} /> @{s.instagram_handle || "julesforher_"}</div>
            <div className="flex items-start gap-3"><Music2 className="h-4 w-4 text-[#DCAEAF] mt-0.5" strokeWidth={1.5} /> @{s.tiktok_handle || "julesforher_"}</div>
          </div>
          <a
            href={waLink(s.whatsapp_number || "27614045481", "Hi Jules For Her ♡")}
            target="_blank" rel="noreferrer"
            data-testid="contact-whatsapp"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#1ea757]"
          ><MessageCircle className="h-4 w-4" /> Order Via WhatsApp</a>
        </div>

        <form onSubmit={submit} className="border border-[#EFD9D9] rounded-md p-8 bg-white space-y-6" data-testid="contact-form">
          <div className="text-xs tracking-[0.3em] uppercase text-[#592C32]">Send us a message</div>
          <input required data-testid="contact-name" className={input} placeholder="Full name" value={form.name} onChange={set("name")} />
          <input required type="email" data-testid="contact-email" className={input} placeholder="Email" value={form.email} onChange={set("email")} />
          <input data-testid="contact-phone" className={input} placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} />
          <textarea required data-testid="contact-message" rows="5" className={input} placeholder="Tell us what you'd love…" value={form.message} onChange={set("message")}></textarea>
          <button type="submit" disabled={loading} data-testid="contact-submit" className="w-full bg-[#592C32] text-white py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23] disabled:opacity-50">
            {loading ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
