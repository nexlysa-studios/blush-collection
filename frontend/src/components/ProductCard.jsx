import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatZAR } from "@/lib/api";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const soldOut = product.sold_out || product.stock <= 0;

  return (
    <div className="group flex flex-col" data-testid={`product-card-${product.slug}`}>
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden bg-[#F6E1DE]/40 rounded-md aspect-[4/5]">
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name} loading="lazy" className="product-img absolute inset-0 w-full h-full object-cover" />
        )}
        {product.images?.[1] && (
          <img src={product.images[1]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        {soldOut && (
          <div className="absolute top-3 left-3 bg-white/90 text-[#592C32] text-[10px] tracking-[0.25em] uppercase px-2 py-1 rounded-full">Sold out</div>
        )}
        {!soldOut && product.featured && (
          <div className="absolute top-3 left-3 bg-[#592C32] text-white text-[10px] tracking-[0.25em] uppercase px-2 py-1 rounded-full">Favourite</div>
        )}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300">
          <button
            data-testid={`add-to-cart-${product.slug}`}
            disabled={soldOut}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product); }}
            className="w-full bg-white text-[#592C32] hover:bg-[#592C32] hover:text-white btn-lift text-[11px] tracking-[0.3em] uppercase py-3 rounded-full disabled:opacity-40"
          >
            {soldOut ? "Sold Out" : "Add To Bag"}
          </button>
        </div>
      </Link>
      <div className="pt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.28em] uppercase text-[#a07a80]">{product.category}</div>
          <Link to={`/product/${product.slug}`} className="block mt-1 font-serif text-lg text-[#2E1C1E] leading-snug hover:text-[#DCAEAF]">{product.name}</Link>
        </div>
        <div className="font-serif text-lg text-[#592C32] whitespace-nowrap">{formatZAR(product.price)}</div>
      </div>
      <button
        data-testid={`add-to-cart-mobile-${product.slug}`}
        disabled={soldOut}
        onClick={() => add(product)}
        className="sm:hidden mt-3 border border-[#592C32] text-[#592C32] text-[11px] tracking-[0.3em] uppercase py-2.5 rounded-full btn-lift disabled:opacity-40"
      >
        {soldOut ? "Sold Out" : "Add To Bag"}
      </button>
    </div>
  );
}
