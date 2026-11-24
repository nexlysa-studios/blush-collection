# Jules For Her — Product Requirements

## Original Problem
Build a complete, production-ready e-commerce website for a South African jewellery brand called "Jules For Her". Cape Town-based, feminine/elegant/soft/premium aesthetic. Brand primary: soft blush pink. Categories: Necklaces, Anklets, Rings, Earrings, Bracelets. Delivery in Cape Town, min order R100. WhatsApp integration to 0614045481.

## User Personas
- **Instagram/TikTok shopper (primary)**: browses on mobile, wants to order via WhatsApp or a quick online checkout.
- **Cape Town local**: needs delivery to home address.
- **Boutique admin (Umm-Kulthum)**: manages products, prices, orders, FAQs, settings.

## Core Requirements (static)
- 5 categories with starting prices (Necklaces R65, Anklets R55, Rings R45, Earrings R45, Bracelets from R60)
- WhatsApp ordering, floating WhatsApp CTA
- Admin can CRUD products, categories, FAQs; manage orders and settings; view customers and messages
- Delivery fee configurable (default R50), min order R100

## Implemented (2026-02)
- Full backend (FastAPI + MongoDB) with JWT admin auth, seed data (5 categories, 15 products, 7 FAQs, site settings)
- Storefront pages: Home, Shop (filters/sorting), Product Detail, Cart, Checkout, Order Success, About, Contact, FAQ
- Admin dashboard: Overview, Products, Orders, Customers, Messages, FAQs, Settings
- WhatsApp integration: floating button, PDP order, checkout hand-off, order success CTA
- Design: Cormorant Garamond + Manrope + Italiana; blush/wine palette; editorial layout

## Backlog / P1
- Yoco card checkout integration (deferred — currently WhatsApp/EFT/COD)
- Product image uploads via object storage
- Email order confirmations (Resend)
- Customer accounts + wishlist
- Advanced analytics (best sellers over time)

## Backlog / P2
- SEO sitemap.xml + robots.txt
- Structured data (Product schema)
- Discount codes

## Hosting update (Supabase/Render/Netlify)
- backend/pgdb.py: Postgres JSONB adapter; server.py uses Supabase when DATABASE_URL is set, MongoDB otherwise (preview stays on Mongo)
- scripts/migrate_to_supabase.py copies all collections Mongo -> Supabase (tested on local Postgres 15)
- render.yaml + backend/requirements-render.txt for Render; netlify.toml + frontend/public/_redirects for Netlify; DEPLOYMENT.md guide
- PENDING: SUPABASE_DATABASE_URL saved is the Direct connection (IPv6-only, unreachable); needs the Session pooler string before migrating
