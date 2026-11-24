import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, formatZAR } from "@/lib/api";
import { LogOut, Package, ShoppingBag, Users, MessageSquare, Settings as SetIcon, HelpCircle, Home as HomeIcon, Plus, Trash2, Pencil, X } from "lucide-react";

const TABS = [
  { k: "overview", label: "Overview", icon: HomeIcon },
  { k: "products", label: "Products", icon: Package },
  { k: "orders", label: "Orders", icon: ShoppingBag },
  { k: "customers", label: "Customers", icon: Users },
  { k: "messages", label: "Messages", icon: MessageSquare },
  { k: "faqs", label: "FAQs", icon: HelpCircle },
  { k: "settings", label: "Settings", icon: SetIcon },
];

const ORDER_STATUSES = ["pending", "paid", "processing", "out for delivery", "completed", "cancelled"];

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("overview");
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);

  const [editProduct, setEditProduct] = useState(null);
  const [editFaq, setEditFaq] = useState(null);

  const logout = () => { localStorage.removeItem("jfh_token"); nav("/admin/login"); };

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => nav("/admin/login"));
  }, [nav]);

  const load = async () => {
    const [st, pr, or, cu, mg, fq, se, ca] = await Promise.all([
      api.get("/admin/stats"), api.get("/products"), api.get("/admin/orders"),
      api.get("/admin/customers"), api.get("/admin/contacts"), api.get("/faqs"),
      api.get("/settings"), api.get("/categories"),
    ]);
    setStats(st.data); setProducts(pr.data); setOrders(or.data); setCustomers(cu.data);
    setMessages(mg.data); setFaqs(fq.data); setSettings(se.data); setCategories(ca.data);
  };
  useEffect(() => { if (me) load(); }, [me]);

  const saveProduct = async (p) => {
    try {
      const payload = { ...p, price: Number(p.price), stock: Number(p.stock),
        images: (p.images_text || "").split("\n").map((s) => s.trim()).filter(Boolean) };
      delete payload.images_text; delete payload.id; delete payload.slug; delete payload.created_at; delete payload.updated_at;
      if (p.id) await api.patch(`/admin/products/${p.id}`, payload);
      else await api.post("/admin/products", payload);
      toast.success("Product saved"); setEditProduct(null); load();
    } catch (e) { toast.error("Save failed"); }
  };
  const delProduct = async (id) => { if (!window.confirm("Delete product?")) return; await api.delete(`/admin/products/${id}`); toast.success("Deleted"); load(); };

  const setOrderStatus = async (id, order_status) => { await api.patch(`/admin/orders/${id}`, { order_status }); load(); };
  const setPayStatus = async (id, payment_status) => { await api.patch(`/admin/orders/${id}`, { payment_status }); load(); };

  const saveFaq = async (f) => {
    const payload = { question: f.question, answer: f.answer, order: Number(f.order || 0) };
    if (f.id) await api.patch(`/admin/faqs/${f.id}`, payload); else await api.post("/admin/faqs", payload);
    toast.success("FAQ saved"); setEditFaq(null); load();
  };
  const delFaq = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/faqs/${id}`); load(); };

  const saveSettings = async () => {
    const payload = { ...settings };
    ["delivery_fee", "min_order"].forEach((k) => payload[k] = Number(payload[k] || 0));
    delete payload.key;
    await api.patch("/admin/settings", payload); toast.success("Settings saved"); load();
  };

  if (!me) return <div className="p-10 font-serif text-2xl">Checking session…</div>;

  const input = "w-full bg-transparent border-b border-[#EFD9D9] py-2 text-sm focus:outline-none focus:border-[#592C32]";

  return (
    <div className="min-h-screen flex bg-cream" data-testid="admin-dashboard">
      <aside className="w-56 border-r border-[#EFE3E1] bg-[#FDF6F5] p-6 flex flex-col">
        <div className="font-brittany text-4xl text-[#592C32] leading-none">Jules For Her</div>
        <div className="text-[10px] tracking-[0.35em] uppercase text-[#8a5c62]">Boutique admin</div>
        <nav className="mt-8 flex-1 space-y-1">
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} data-testid={`tab-${t.k}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left ${tab === t.k ? "bg-[#592C32] text-white" : "text-[#3E1E23] hover:bg-[#F1CFCB]"}`}>
              <t.icon className="h-4 w-4" strokeWidth={1.4} /> {t.label}
            </button>
          ))}
        </nav>
        <Link to="/" className="text-xs tracking-[0.25em] uppercase text-[#8a5c62] mt-4">← View site</Link>
        <button onClick={logout} data-testid="admin-logout" className="mt-3 inline-flex items-center gap-2 text-xs text-[#B54044] hover:opacity-70"><LogOut className="h-4 w-4" /> Sign out</button>
      </aside>

      <main className="flex-1 p-6 sm:p-10 max-w-full overflow-x-hidden">
        {tab === "overview" && stats && (
          <div>
            <h1 className="font-serif text-4xl text-[#2E1C1E]">Overview</h1>
            <p className="text-sm text-[#8a5c62] mt-1">Welcome back, {me.name}.</p>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Sales", value: formatZAR(stats.total_sales) },
                { label: "Orders", value: stats.orders },
                { label: "Customers", value: stats.customers },
                { label: "Products", value: stats.products },
                { label: "Low Stock", value: stats.low_stock },
              ].map((c) => (
                <div key={c.label} className="border border-[#EFD9D9] rounded-md bg-white p-5">
                  <div className="text-[10px] tracking-[0.3em] uppercase text-[#8a5c62]">{c.label}</div>
                  <div className="font-serif text-3xl text-[#2E1C1E] mt-2">{c.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <div className="font-serif text-2xl text-[#2E1C1E] mb-4">Recent orders</div>
              <div className="border border-[#EFD9D9] rounded-md bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FDF6F5] text-[10px] tracking-[0.25em] uppercase text-[#8a5c62]">
                    <tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th></tr>
                  </thead>
                  <tbody>{orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="border-t border-[#EFD9D9]">
                      <td className="p-3 font-serif">{o.order_number}</td>
                      <td className="p-3">{o.customer_name}</td>
                      <td className="p-3">{formatZAR(o.total)}</td>
                      <td className="p-3 capitalize">{o.order_status}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-4xl text-[#2E1C1E]">Products</h1>
              <button data-testid="add-product-btn" onClick={() => setEditProduct({ name: "", description: "", price: 0, category: categories[0]?.slug || "necklaces", images_text: "", stock: 10, featured: false, sold_out: false })} className="inline-flex items-center gap-2 bg-[#592C32] text-white px-5 py-2.5 rounded-full text-xs tracking-[0.3em] uppercase btn-lift"><Plus className="h-4 w-4" /> New</button>
            </div>
            <div className="mt-6 border border-[#EFD9D9] rounded-md bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FDF6F5] text-[10px] tracking-[0.25em] uppercase text-[#8a5c62]">
                  <tr><th className="text-left p-3">Image</th><th className="text-left p-3">Name</th><th className="text-left p-3">Category</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">Featured</th><th className="text-right p-3">Actions</th></tr>
                </thead>
                <tbody>{products.map((p) => (
                  <tr key={p.id} className="border-t border-[#EFD9D9]">
                    <td className="p-3"><img src={p.images?.[0]} alt="" className="w-12 h-14 object-cover rounded-sm" /></td>
                    <td className="p-3 font-serif">{p.name}</td>
                    <td className="p-3 capitalize">{p.category}</td>
                    <td className="p-3">{formatZAR(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.featured ? "★" : "—"}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditProduct({ ...p, images_text: (p.images || []).join("\n") })} className="p-1.5 text-[#592C32] hover:text-[#DCAEAF]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => delProduct(p.id)} className="p-1.5 text-[#B54044] hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h1 className="font-serif text-4xl text-[#2E1C1E]">Orders</h1>
            <div className="mt-6 space-y-4">{orders.map((o) => (
              <div key={o.id} className="border border-[#EFD9D9] rounded-md bg-white p-5" data-testid={`order-${o.order_number}`}>
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#8a5c62]">{new Date(o.created_at).toLocaleString()}</div>
                    <div className="font-serif text-xl text-[#2E1C1E]">{o.order_number} — {o.customer_name}</div>
                    <div className="text-sm text-[#6b4c50]">{o.phone} · {o.email}</div>
                    <div className="text-sm text-[#6b4c50]">{o.address}, {o.suburb}, {o.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-2xl text-[#592C32]">{formatZAR(o.total)}</div>
                    <div className="text-xs text-[#8a5c62]">{o.items.length} items</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 items-center text-xs">
                  <label className="flex items-center gap-2">Status
                    <select value={o.order_status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className="border border-[#EFD9D9] rounded-md px-2 py-1 capitalize">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">Payment
                    <select value={o.payment_status} onChange={(e) => setPayStatus(o.id, e.target.value)} className="border border-[#EFD9D9] rounded-md px-2 py-1 capitalize">
                      {["pending", "paid", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ))}</div>
          </div>
        )}

        {tab === "customers" && (
          <div>
            <h1 className="font-serif text-4xl text-[#2E1C1E]">Customers</h1>
            <div className="mt-6 border border-[#EFD9D9] rounded-md bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FDF6F5] text-[10px] tracking-[0.25em] uppercase text-[#8a5c62]">
                  <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Orders</th><th className="text-left p-3">Last order</th></tr>
                </thead>
                <tbody>{customers.map((c) => (
                  <tr key={c.id} className="border-t border-[#EFD9D9]">
                    <td className="p-3 font-serif">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{c.order_count}</td>
                    <td className="p-3">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div>
            <h1 className="font-serif text-4xl text-[#2E1C1E]">Messages</h1>
            <div className="mt-6 space-y-3">{messages.map((m) => (
              <div key={m.id} className="border border-[#EFD9D9] rounded-md bg-white p-5">
                <div className="flex justify-between text-xs text-[#8a5c62]"><span>{m.name} · {m.email} {m.phone && `· ${m.phone}`}</span><span>{new Date(m.created_at).toLocaleString()}</span></div>
                <p className="mt-2 text-sm text-[#3E1E23]">{m.message}</p>
              </div>
            ))}</div>
          </div>
        )}

        {tab === "faqs" && (
          <div>
            <div className="flex justify-between items-center">
              <h1 className="font-serif text-4xl text-[#2E1C1E]">FAQs</h1>
              <button onClick={() => setEditFaq({ question: "", answer: "", order: faqs.length })} className="inline-flex items-center gap-2 bg-[#592C32] text-white px-5 py-2.5 rounded-full text-xs tracking-[0.3em] uppercase btn-lift"><Plus className="h-4 w-4" /> New</button>
            </div>
            <div className="mt-6 space-y-3">{faqs.map((f) => (
              <div key={f.id} className="border border-[#EFD9D9] rounded-md bg-white p-5">
                <div className="flex justify-between gap-4">
                  <div className="flex-1"><div className="font-serif text-lg text-[#2E1C1E]">{f.question}</div><div className="text-sm text-[#6b4c50] mt-1">{f.answer}</div></div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditFaq(f)} className="p-1.5 text-[#592C32]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => delFaq(f.id)} className="p-1.5 text-[#B54044]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}</div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <h1 className="font-serif text-4xl text-[#2E1C1E]">Site Settings</h1>
            <div className="mt-6 max-w-3xl grid sm:grid-cols-2 gap-6">
              {[
                ["delivery_fee", "Delivery fee (R)"], ["min_order", "Minimum order (R)"],
                ["whatsapp_number", "WhatsApp (with country code)"], ["instagram_handle", "Instagram handle"],
                ["tiktok_handle", "TikTok handle"], ["announcement", "Announcement bar text"],
                ["about_headline", "About headline"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="text-[10px] tracking-[0.3em] uppercase text-[#8a5c62]">{l}</label>
                  <input className={input} value={settings[k] || ""} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))} data-testid={`set-${k}`} />
                </div>
              ))}
              {[
                ["about_text", "About text"], ["delivery_info", "Delivery info"],
                ["returns_info", "Returns info"], ["care_info", "Care info"],
              ].map(([k, l]) => (
                <div key={k} className="sm:col-span-2">
                  <label className="text-[10px] tracking-[0.3em] uppercase text-[#8a5c62]">{l}</label>
                  <textarea rows="3" className={input} value={settings[k] || ""} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))} data-testid={`set-${k}`}></textarea>
                </div>
              ))}
            </div>
            <button onClick={saveSettings} className="mt-6 bg-[#592C32] text-white px-8 py-3 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Save settings</button>
          </div>
        )}
      </main>

      {editProduct && (
        <div className="fixed inset-0 z-50 bg-[#2E1C1E]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="font-serif text-2xl text-[#2E1C1E]">{editProduct.id ? "Edit product" : "New product"}</div>
              <button onClick={() => setEditProduct(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="sm:col-span-2 text-sm">Name<input data-testid="pf-name" className={input} value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} /></label>
              <label className="text-sm">Price (R)<input type="number" data-testid="pf-price" className={input} value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} /></label>
              <label className="text-sm">Stock<input type="number" data-testid="pf-stock" className={input} value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })} /></label>
              <label className="text-sm">Category
                <select className={input} value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
              <label className="text-sm flex items-center gap-2 mt-6"><input type="checkbox" checked={!!editProduct.featured} onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })} /> Featured</label>
              <label className="text-sm flex items-center gap-2 mt-6"><input type="checkbox" checked={!!editProduct.sold_out} onChange={(e) => setEditProduct({ ...editProduct, sold_out: e.target.checked })} /> Sold out</label>
              <label className="sm:col-span-2 text-sm">Description<textarea rows="3" data-testid="pf-desc" className={input} value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}></textarea></label>
              <label className="sm:col-span-2 text-sm">Image URLs (one per line)<textarea rows="4" data-testid="pf-images" className={input} value={editProduct.images_text} onChange={(e) => setEditProduct({ ...editProduct, images_text: e.target.value })}></textarea></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditProduct(null)} className="px-6 py-3 rounded-full text-xs tracking-[0.3em] uppercase text-[#592C32]">Cancel</button>
              <button data-testid="pf-save" onClick={() => saveProduct(editProduct)} className="bg-[#592C32] text-white px-8 py-3 rounded-full text-xs tracking-[0.3em] uppercase btn-lift">Save</button>
            </div>
          </div>
        </div>
      )}

      {editFaq && (
        <div className="fixed inset-0 z-50 bg-[#2E1C1E]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="font-serif text-2xl">{editFaq.id ? "Edit FAQ" : "New FAQ"}</div>
              <button onClick={() => setEditFaq(null)}><X className="h-5 w-5" /></button>
            </div>
            <label className="text-sm block mb-4">Question<input className={input} value={editFaq.question} onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })} /></label>
            <label className="text-sm block mb-4">Answer<textarea rows="4" className={input} value={editFaq.answer} onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })}></textarea></label>
            <label className="text-sm block mb-4">Order<input type="number" className={input} value={editFaq.order} onChange={(e) => setEditFaq({ ...editFaq, order: e.target.value })} /></label>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditFaq(null)} className="px-6 py-3 rounded-full text-xs tracking-[0.3em] uppercase">Cancel</button>
              <button onClick={() => saveFaq(editFaq)} className="bg-[#592C32] text-white px-8 py-3 rounded-full text-xs tracking-[0.3em] uppercase">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
