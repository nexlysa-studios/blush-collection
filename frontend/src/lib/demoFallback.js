import demo from "@/data/demoData.json";

// Built-in shop data used when the backend can't be reached (e.g. a frontend-only Netlify link).
const ORDERS_KEY = "jfh_demo_orders";

const ok = (config, data) => ({ data, status: 200, statusText: "OK", headers: {}, config });
const fail = (config, status, detail) => Promise.reject({ config, response: { status, data: { detail } } });

const readOrders = () => {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "{}"); } catch { return {}; }
};

function filterProducts(params = {}) {
  let list = [...demo.products];
  if (params.category && params.category !== "all") list = list.filter((p) => p.category === params.category.toLowerCase());
  if (params.featured !== undefined) list = list.filter((p) => p.featured === (params.featured === true || params.featured === "true"));
  if (params.in_stock) list = list.filter((p) => !p.sold_out && p.stock > 0);
  return list;
}

function createOrder(config) {
  const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
  const { delivery_fee, min_order } = demo.settings;
  const subtotal = body.items.reduce((s, i) => s + i.price * i.quantity, 0);
  if (subtotal < min_order) return fail(config, 400, `Minimum order is R${min_order}`);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const order = {
    ...body,
    id: crypto.randomUUID(),
    order_number: `JFH-${date}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    subtotal, delivery_fee, total: subtotal + delivery_fee,
    payment_status: "pending", order_status: "pending",
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(ORDERS_KEY, JSON.stringify({ ...readOrders(), [order.order_number]: order }));
  return ok(config, order);
}

export function demoFallback(config) {
  if (!config) return null;
  const method = (config.method || "get").toLowerCase();
  const path = (config.url || "").split("?")[0];

  if (path.startsWith("/auth") || path.startsWith("/admin")) {
    return fail(config, 503, "Admin isn't available on this preview link yet — it needs the live backend.");
  }
  if (method === "get") {
    if (path === "/categories") return ok(config, demo.categories);
    if (path === "/settings") return ok(config, demo.settings);
    if (path === "/faqs") return ok(config, demo.faqs);
    if (path === "/products") return ok(config, filterProducts(config.params));
    if (path.startsWith("/products/")) {
      const p = demo.products.find((x) => x.slug === path.slice("/products/".length));
      return p ? ok(config, p) : fail(config, 404, "Product not found");
    }
    if (path.startsWith("/orders/")) {
      const o = readOrders()[path.slice("/orders/".length)];
      return o ? ok(config, o) : fail(config, 404, "Order not found");
    }
  }
  if (method === "post" && path === "/orders") return createOrder(config);
  if (method === "post" && path === "/contact") return ok(config, { ok: true });
  return null;
}
