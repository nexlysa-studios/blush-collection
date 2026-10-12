import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, formatZAR, waLink } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { MessageCircle } from "lucide-react";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const s = useSettings();
  const navigate = useNavigate();
  const delivery = Number(s.delivery_fee || 50);
  const total = subtotal + delivery;

  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "", address: "", suburb: "", city: "Cape Town", notes: "", payment_method: "whatsapp",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-4xl text-[#2E1C1E]">Your bag is empty.</h1>
        <Link to="/shop" className="mt-6 inline-block bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Shop Now</Link>
      </div>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      };
      const r = await api.post("/orders", payload);
      const orderNumber = r.data.order_number;

      if (form.payment_method === "whatsapp") {
        const lines = items.map((i) => `• ${i.name} x${i.quantity}  ${formatZAR(i.price * i.quantity)}`).join("\n");
        const msg = `Hi Jules For Her ♡\nI've placed order ${orderNumber}\n\n${lines}\n\nSubtotal: ${formatZAR(subtotal)}\nDelivery: ${formatZAR(delivery)}\nTotal: ${formatZAR(total)}\n\nName: ${form.customer_name}\nAddress: ${form.address}, ${form.suburb}, ${form.city}\nPhone: ${form.phone}`;
        window.open(waLink(s.whatsapp_number, msg), "_blank");
      }

      clear();
      toast.success("Order placed! We'll be in touch shortly.");
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const input = "w-full bg-transparent border-b border-[#EFD9D9] py-3 text-[15px] font-body placeholder:text-[#b28b90] focus:outline-none focus:border-[#592C32]";

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-12 sm:py-16">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Checkout</div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2 mb-10">Almost there.</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-12" data-testid="checkout-form">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#592C32] mb-4">Contact</div>
            <div className="grid sm:grid-cols-2 gap-6">
              <input required data-testid="ck-name" className={input} placeholder="Full name" value={form.customer_name} onChange={set("customer_name")} />
              <input required type="email" data-testid="ck-email" className={input} placeholder="Email" value={form.email} onChange={set("email")} />
              <input required data-testid="ck-phone" className={input} placeholder="Phone / WhatsApp number" value={form.phone} onChange={set("phone")} />
            </div>
          </div>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#592C32] mb-4">Delivery</div>
            <div className="grid sm:grid-cols-2 gap-6">
              <input required data-testid="ck-address" className={`${input} sm:col-span-2`} placeholder="Delivery address" value={form.address} onChange={set("address")} />
              <input required data-testid="ck-suburb" className={input} placeholder="Suburb" value={form.suburb} onChange={set("suburb")} />
              <input required data-testid="ck-city" className={input} placeholder="City" value={form.city} onChange={set("city")} />
              <textarea data-testid="ck-notes" rows="3" className={`${input} sm:col-span-2`} placeholder="Delivery notes (optional)" value={form.notes} onChange={set("notes")}></textarea>
            </div>
          </div>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#592C32] mb-4">Payment</div>
            <div className="space-y-3" data-testid="ck-payment">
              {[
                { v: "whatsapp", t: "Confirm & pay via WhatsApp", d: "We'll message you on WhatsApp to confirm and share EFT / delivery details." },
                { v: "eft", t: "EFT / Bank Transfer", d: "Bank details will be shared once your order is confirmed." },
                { v: "cod", t: "Cash on delivery (Cape Town)", d: "Pay cash to the driver on arrival." },
              ].map((o) => (
                <label key={o.v} className={`flex gap-3 items-start border rounded-md p-4 cursor-pointer ${form.payment_method === o.v ? "border-[#592C32] bg-[#FDF6F5]" : "border-[#EFD9D9]"}`}>
                  <input type="radio" name="pm" value={o.v} checked={form.payment_method === o.v} onChange={set("payment_method")} className="mt-1 accent-[#592C32]" />
                  <div>
                    <div className="font-serif text-lg text-[#2E1C1E]">{o.t}</div>
                    <div className="text-xs text-[#6b4c50]">{o.d}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#8a5c62]">Card checkout (Yoco) coming soon.</p>
          </div>
        </div>

        <aside>
          <div className="border border-[#EFD9D9] rounded-md p-6 bg-white sticky top-24" data-testid="checkout-summary">
            <div className="font-serif text-2xl text-[#2E1C1E] mb-4">Your Order</div>
            <div className="space-y-3 max-h-72 overflow-auto pr-1">
              {items.map((i) => (
                <div key={i.product_id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-14 bg-[#FDF6F5] rounded-sm overflow-hidden flex-shrink-0">{i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[#2E1C1E] truncate">{i.name}</div>
                    <div className="text-xs text-[#8a5c62]">Qty {i.quantity}</div>
                  </div>
                  <div className="font-serif text-[#592C32]">{formatZAR(i.price * i.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="h-px bg-[#EFD9D9] my-4"></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatZAR(delivery)}</span></div>
              <div className="flex justify-between font-serif text-xl pt-2"><span>Total</span><span>{formatZAR(total)}</span></div>
            </div>
            <button type="submit" disabled={loading} data-testid="place-order-btn" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#592C32] text-white py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23] disabled:opacity-50">
              {loading ? "Placing…" : "Place Order"} {form.payment_method === "whatsapp" && <MessageCircle className="h-4 w-4" />}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
