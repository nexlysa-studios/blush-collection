import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatZAR, waLink } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { MessageCircle } from "lucide-react";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const s = useSettings();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => { api.get(`/orders/${orderNumber}`).then((r) => setOrder(r.data)).catch(() => setMissing(true)); }, [orderNumber]);

  if (missing) return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center" data-testid="order-not-found">
      <h1 className="font-serif text-4xl text-[#2E1C1E]">We couldn't find that order.</h1>
      <p className="mt-3 text-[#6b4c50]">Please check the order number, or message us on WhatsApp and we'll help.</p>
      <Link to="/shop" className="mt-8 inline-block bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Back To Shop</Link>
    </div>
  );
  if (!order) return <div className="py-24 text-center font-serif text-2xl">Loading…</div>;

  const lines = order.items.map((i) => `• ${i.name} x${i.quantity}  ${formatZAR(i.price * i.quantity)}`).join("\n");
  const msg = `Hi Jules For Her ♡ — I placed order ${order.order_number}\n${lines}\nTotal ${formatZAR(order.total)}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24 text-center">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Order Confirmed</div>
      <h1 className="font-serif text-5xl sm:text-6xl text-[#2E1C1E] mt-3">Thank You For Your Order <span className="text-[#DCAEAF]">♡</span></h1>
      <p className="mt-4 text-[#6b4c50]">A confirmation has been saved. Please send us a WhatsApp so we can arrange payment and delivery.</p>

      <div className="mt-10 border border-[#EFD9D9] rounded-md bg-white p-6 sm:p-10 text-left" data-testid="order-summary">
        <div className="flex flex-wrap justify-between gap-3 pb-4 border-b border-[#EFD9D9]">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62]">Order number</div>
            <div className="font-serif text-2xl text-[#2E1C1E]" data-testid="order-number">{order.order_number}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62]">Total</div>
            <div className="font-serif text-2xl text-[#592C32]">{formatZAR(order.total)}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-[#EFD9D9]">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-2">Delivering to</div>
            <div className="font-serif text-lg text-[#2E1C1E]">{order.customer_name}</div>
            <div className="text-sm text-[#6b4c50]">{order.address}<br />{order.suburb}, {order.city}</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-[#8a5c62] mb-2">Contact</div>
            <div className="text-sm text-[#3E1E23]">{order.phone}</div>
            <div className="text-sm text-[#3E1E23]">{order.email}</div>
          </div>
        </div>

        <div className="py-6 space-y-3">
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="font-serif text-[#2E1C1E]">{i.name} <span className="text-[#8a5c62]">×{i.quantity}</span></span>
              <span className="font-serif text-[#592C32]">{formatZAR(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-[#EFD9D9] flex justify-between text-sm"><span>Subtotal</span><span>{formatZAR(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{formatZAR(order.delivery_fee)}</span></div>
          <div className="flex justify-between font-serif text-xl"><span>Total</span><span>{formatZAR(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a href={waLink(s.whatsapp_number, msg)} target="_blank" rel="noreferrer" data-testid="whatsapp-us" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#1ea757]">
          <MessageCircle className="h-4 w-4" /> WhatsApp Us
        </a>
        <Link to="/shop" className="inline-flex items-center justify-center bg-[#FADADD] text-[#592C32] hover:bg-[#DCAEAF] hover:text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Keep Shopping</Link>
      </div>
    </div>
  );
}
