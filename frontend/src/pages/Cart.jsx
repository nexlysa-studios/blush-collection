import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatZAR } from "@/lib/api";
import { Minus, Plus, X, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQty, remove, subtotal } = useCart();
  const s = useSettings();
  const delivery = items.length ? Number(s.delivery_fee || 50) : 0;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Your Bag</div>
        <h1 className="font-serif text-5xl text-[#2E1C1E] mt-2">Nothing here yet.</h1>
        <p className="mt-3 text-sm text-[#6b4c50]">Add a little sparkle to your day.</p>
        <Link to="/shop" className="mt-8 inline-block bg-[#592C32] text-white px-8 py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23]">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10 py-12 sm:py-16">
      <div className="text-[11px] tracking-[0.4em] uppercase text-[#8a5c62]">Your Bag</div>
      <h1 className="font-serif text-4xl sm:text-5xl text-[#2E1C1E] mt-2 mb-10">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2" data-testid="cart-items">
          <div className="hidden sm:grid grid-cols-12 pb-3 border-b border-[#EFD9D9] text-[10px] tracking-[0.3em] uppercase text-[#8a5c62]">
            <div className="col-span-6">Product</div><div className="col-span-2 text-center">Price</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-right">Total</div>
          </div>
          {items.map((it) => (
            <div key={it.product_id} className="grid grid-cols-12 gap-4 py-6 border-b border-[#EFD9D9] items-center" data-testid={`cart-item-${it.product_id}`}>
              <div className="col-span-12 sm:col-span-6 flex gap-4">
                <Link to={`/product/${it.slug}`} className="w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 overflow-hidden rounded-sm bg-[#FDF6F5]">
                  {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link to={`/product/${it.slug}`} className="font-serif text-lg text-[#2E1C1E] leading-tight hover:text-[#DCAEAF]">{it.name}</Link>
                  <button onClick={() => remove(it.product_id)} className="mt-auto text-xs tracking-[0.2em] uppercase text-[#8a5c62] hover:text-[#B54044] inline-flex items-center gap-1 self-start" data-testid={`remove-${it.product_id}`}>
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 sm:text-center font-serif text-lg text-[#592C32]">{formatZAR(it.price)}</div>
              <div className="col-span-4 sm:col-span-2 flex sm:justify-center">
                <div className="flex items-center border border-[#EFD9D9] rounded-full">
                  <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="p-2 text-[#592C32]"><Minus className="h-3.5 w-3.5" /></button>
                  <div className="w-6 text-center text-sm">{it.quantity}</div>
                  <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="p-2 text-[#592C32]"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="col-span-4 sm:col-span-2 sm:text-right font-serif text-lg text-[#2E1C1E]">{formatZAR(it.price * it.quantity)}</div>
            </div>
          ))}
        </div>
        <aside>
          <div className="border border-[#EFD9D9] rounded-md p-6 bg-white sticky top-24" data-testid="cart-summary">
            <div className="font-serif text-2xl text-[#2E1C1E] mb-4">Summary</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#6b4c50]">Subtotal</span><span className="font-serif text-[#2E1C1E]" data-testid="cart-subtotal">{formatZAR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#6b4c50]">Delivery (Cape Town)</span><span className="font-serif text-[#2E1C1E]">{formatZAR(delivery)}</span></div>
              <div className="h-px bg-[#EFD9D9] my-3"></div>
              <div className="flex justify-between font-serif text-2xl"><span>Total</span><span data-testid="cart-total">{formatZAR(total)}</span></div>
            </div>
            <Link to="/checkout" data-testid="proceed-to-checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#592C32] text-white py-4 rounded-full text-xs tracking-[0.3em] uppercase btn-lift hover:bg-[#3E1E23]">
              Proceed To Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-xs tracking-[0.25em] uppercase text-[#592C32] hover:text-[#DCAEAF]">Continue shopping</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
