from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------- Setup ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("jules")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Jules For Her API")
api = APIRouter(prefix="/api")

JWT_ALG = "HS256"
JWT_EXP_HOURS = 24 * 7  # 7 days


# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9\s-]", "", text).strip().lower()
    s = re.sub(r"[\s_-]+", "-", s)
    return s or new_id()[:8]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALG)


security = HTTPBearer(auto_error=False)


async def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if credentials is None:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, os.environ["JWT_SECRET"], algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token")
        user = await db.users.find_one({"id": payload["sub"], "role": "admin"})
        if not user:
            raise HTTPException(401, "Admin not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


def clean(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return None
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class CategoryIn(BaseModel):
    name: str
    starting_price: float
    image_url: Optional[str] = None
    description: Optional[str] = ""


class ProductIn(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str
    images: List[str] = []
    stock: int = 10
    featured: bool = False
    sold_out: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    sold_out: Optional[bool] = None


class OrderItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: Optional[str] = None


class OrderIn(BaseModel):
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    suburb: str
    city: str = "Cape Town"
    notes: Optional[str] = ""
    payment_method: str = "whatsapp"  # whatsapp | cod | eft
    items: List[OrderItemIn]


class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None


class FAQIn(BaseModel):
    question: str
    answer: str
    order: int = 0


class SettingsUpdate(BaseModel):
    delivery_fee: Optional[float] = None
    min_order: Optional[float] = None
    whatsapp_number: Optional[str] = None
    instagram_handle: Optional[str] = None
    tiktok_handle: Optional[str] = None
    about_text: Optional[str] = None
    about_headline: Optional[str] = None
    delivery_info: Optional[str] = None
    returns_info: Optional[str] = None
    care_info: Optional[str] = None
    announcement: Optional[str] = None


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str


# ---------- Auth ----------
@api.post("/auth/login")
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}}


@api.get("/auth/me")
async def me(admin=Depends(require_admin)):
    return admin


# ---------- Public: Categories, Products ----------
@api.get("/categories")
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return cats


@api.get("/products")
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None, in_stock: Optional[bool] = None):
    q: Dict[str, Any] = {}
    if category and category.lower() != "all":
        q["category"] = category.lower()
    if featured is not None:
        q["featured"] = featured
    if in_stock:
        q["sold_out"] = False
        q["stock"] = {"$gt": 0}
    items = await db.products.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p


# ---------- Public: Settings, FAQs ----------
@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return s or {}


@api.get("/faqs")
async def list_faqs():
    items = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return items


# ---------- Public: Orders ----------
@api.post("/orders")
async def create_order(order: OrderIn):
    settings = await db.settings.find_one({"key": "site"}) or {}
    delivery_fee = float(settings.get("delivery_fee", 50))
    min_order = float(settings.get("min_order", 100))

    subtotal = sum(i.price * i.quantity for i in order.items)
    if subtotal < min_order:
        raise HTTPException(400, f"Minimum order is R{min_order:.0f}")
    total = subtotal + delivery_fee

    order_number = "JFH-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + new_id()[:6].upper()
    doc = {
        "id": new_id(),
        "order_number": order_number,
        "customer_name": order.customer_name,
        "email": order.email.lower(),
        "phone": order.phone,
        "address": order.address,
        "suburb": order.suburb,
        "city": order.city,
        "notes": order.notes or "",
        "payment_method": order.payment_method,
        "items": [i.model_dump() for i in order.items],
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": total,
        "payment_status": "pending",
        "order_status": "pending",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(doc)

    # Reduce stock (best-effort)
    for i in order.items:
        await db.products.update_one({"id": i.product_id}, {"$inc": {"stock": -i.quantity}})

    # Save/update customer
    await db.customers.update_one(
        {"email": order.email.lower()},
        {
            "$set": {
                "email": order.email.lower(),
                "name": order.customer_name,
                "phone": order.phone,
                "last_order_at": now_iso(),
            },
            "$setOnInsert": {"id": new_id(), "created_at": now_iso()},
            "$inc": {"order_count": 1},
        },
        upsert=True,
    )

    doc.pop("_id", None)
    return doc


@api.get("/orders/{order_number}")
async def get_order_by_number(order_number: str):
    o = await db.orders.find_one({"order_number": order_number}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Order not found")
    return o


# ---------- Contact ----------
@api.post("/contact")
async def submit_contact(data: ContactIn):
    doc = {
        "id": new_id(),
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone or "",
        "message": data.message,
        "read": False,
        "created_at": now_iso(),
    }
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True}


# ---------- Admin ----------
@api.get("/admin/stats")
async def admin_stats(admin=Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    total_sales = sum(o.get("total", 0) for o in orders if o.get("payment_status") == "paid")
    order_count = len(orders)
    customer_count = await db.customers.count_documents({})
    product_count = await db.products.count_documents({})
    low_stock = await db.products.count_documents({"stock": {"$lte": 3, "$gt": 0}, "sold_out": False})
    return {
        "total_sales": total_sales,
        "orders": order_count,
        "customers": customer_count,
        "products": product_count,
        "low_stock": low_stock,
    }


@api.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, upd: OrderStatusUpdate, admin=Depends(require_admin)):
    fields = {k: v for k, v in upd.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "Nothing to update")
    await db.orders.update_one({"id": order_id}, {"$set": fields})
    return clean(await db.orders.find_one({"id": order_id}))


@api.get("/admin/customers")
async def admin_customers(admin=Depends(require_admin)):
    return await db.customers.find({}, {"_id": 0}).sort("last_order_at", -1).to_list(500)


@api.get("/admin/contacts")
async def admin_contacts(admin=Depends(require_admin)):
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# Products CRUD
@api.post("/admin/products")
async def admin_create_product(p: ProductIn, admin=Depends(require_admin)):
    slug_base = slugify(p.name)
    slug = slug_base
    n = 1
    while await db.products.find_one({"slug": slug}):
        n += 1
        slug = f"{slug_base}-{n}"
    doc = {"id": new_id(), "slug": slug, **p.model_dump(), "created_at": now_iso(), "updated_at": now_iso()}
    doc["category"] = doc["category"].lower()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/admin/products/{product_id}")
async def admin_update_product(product_id: str, p: ProductUpdate, admin=Depends(require_admin)):
    fields = {k: v for k, v in p.model_dump().items() if v is not None}
    if "category" in fields:
        fields["category"] = fields["category"].lower()
    if "name" in fields:
        fields["slug"] = slugify(fields["name"])
    fields["updated_at"] = now_iso()
    await db.products.update_one({"id": product_id}, {"$set": fields})
    return clean(await db.products.find_one({"id": product_id}))


@api.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin=Depends(require_admin)):
    await db.products.delete_one({"id": product_id})
    return {"ok": True}


# Categories CRUD
@api.post("/admin/categories")
async def admin_create_category(c: CategoryIn, admin=Depends(require_admin)):
    doc = {
        "id": new_id(),
        "slug": slugify(c.name),
        "name": c.name,
        "starting_price": c.starting_price,
        "image_url": c.image_url or "",
        "description": c.description or "",
        "order": await db.categories.count_documents({}),
    }
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/admin/categories/{cat_id}")
async def admin_update_category(cat_id: str, c: CategoryIn, admin=Depends(require_admin)):
    fields = c.model_dump()
    fields["slug"] = slugify(c.name)
    await db.categories.update_one({"id": cat_id}, {"$set": fields})
    return clean(await db.categories.find_one({"id": cat_id}))


@api.delete("/admin/categories/{cat_id}")
async def admin_delete_category(cat_id: str, admin=Depends(require_admin)):
    await db.categories.delete_one({"id": cat_id})
    return {"ok": True}


# FAQs CRUD
@api.post("/admin/faqs")
async def admin_create_faq(f: FAQIn, admin=Depends(require_admin)):
    doc = {"id": new_id(), **f.model_dump()}
    await db.faqs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.patch("/admin/faqs/{faq_id}")
async def admin_update_faq(faq_id: str, f: FAQIn, admin=Depends(require_admin)):
    await db.faqs.update_one({"id": faq_id}, {"$set": f.model_dump()})
    return clean(await db.faqs.find_one({"id": faq_id}))


@api.delete("/admin/faqs/{faq_id}")
async def admin_delete_faq(faq_id: str, admin=Depends(require_admin)):
    await db.faqs.delete_one({"id": faq_id})
    return {"ok": True}


# Settings
@api.patch("/admin/settings")
async def admin_update_settings(s: SettingsUpdate, admin=Depends(require_admin)):
    fields = {k: v for k, v in s.model_dump().items() if v is not None}
    await db.settings.update_one({"key": "site"}, {"$set": fields}, upsert=True)
    return clean(await db.settings.find_one({"key": "site"}))


# ---------- Seeding ----------
DEFAULT_CATEGORIES = [
    {"name": "Necklaces", "starting_price": 65, "image_url": "https://images.unsplash.com/photo-1616294099799-dab525ec05c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxuZWNrbGFjZSUyMG9uJTIwd29tYW4lMjBqZXdlbHJ5fGVufDB8fHx8MTc4ODQzNzkwMnww&ixlib=rb-4.1.0&q=85"},
    {"name": "Anklets", "starting_price": 55, "image_url": "https://images.unsplash.com/photo-1595051572626-aecfdafb53f2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxhbmtsZXQlMjBqZXdlbHJ5JTIwZm9vdCUyMHdvbWFufGVufDB8fHx8MTc4ODQzNzg4Nnww&ixlib=rb-4.1.0&q=85"},
    {"name": "Rings", "starting_price": 45, "image_url": "https://images.unsplash.com/photo-1614606140245-2c33ece9e2cf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxnb2xkJTIwcmluZ3MlMjBoYW5kJTIwamV3ZWxyeXxlbnwwfHx8fDE3ODg0Mzc4OTV8MA&ixlib=rb-4.1.0&q=85"},
    {"name": "Earrings", "starting_price": 45, "image_url": "https://images.unsplash.com/photo-1652766540048-de0a878a3266?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHx3b21hbiUyMHdlYXJpbmclMjBlbGVnYW50JTIwZWFycmluZ3MlMjBqZXdlbHJ5fGVufDB8fHx8MTc4ODQzNzg4Nnww&ixlib=rb-4.1.0&q=85"},
    {"name": "Bracelets", "starting_price": 60, "image_url": "https://images.unsplash.com/photo-1629118639934-2b241503956c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxnb2xkJTIwcmluZ3MlMjBoYW5kJTIwamV3ZWxyeXxlbnwwfHx8fDE3ODg0Mzc4OTV8MA&ixlib=rb-4.1.0&q=85"},
]

PRODUCT_IMG = {
    "necklaces": [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620656798932-902f8b1585b7?w=900&q=80&auto=format&fit=crop",
    ],
    "anklets": [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80&auto=format&fit=crop",
    ],
    "rings": [
        "https://images.unsplash.com/photo-1603561591406-cf8f2fda27a2?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=900&q=80&auto=format&fit=crop",
    ],
    "earrings": [
        "https://images.unsplash.com/photo-1635767798638-3665a0a107b8?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620656798932-902f8b1585b7?w=900&q=80&auto=format&fit=crop",
    ],
    "bracelets": [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?w=900&q=80&auto=format&fit=crop",
    ],
}

DEFAULT_PRODUCTS = [
    {"name": "Delicate Heart Pendant Necklace", "category": "necklaces", "price": 65, "featured": True,
     "description": "A dainty heart pendant on a fine chain. The everyday piece that layers beautifully."},
    {"name": "Layered Gold Chain Necklace", "category": "necklaces", "price": 85, "featured": True,
     "description": "Two delicate chains, one perfect look. Wear alone or stack with your favourites."},
    {"name": "Freshwater Pearl Choker", "category": "necklaces", "price": 95, "featured": False,
     "description": "Tiny freshwater pearls set on a fine gold-tone chain — a soft touch of romance."},
    {"name": "Butterfly Charm Anklet", "category": "anklets", "price": 55, "featured": True,
     "description": "A whisper of gold with a delicate butterfly charm. Made for warm afternoons."},
    {"name": "Beaded Shell Anklet", "category": "anklets", "price": 65, "featured": False,
     "description": "Cream beads and a tiny shell charm — an ode to slow summer days."},
    {"name": "Dainty Signet Ring", "category": "rings", "price": 45, "featured": True,
     "description": "A minimalist signet in gold-tone finish. Understated, stackable, endlessly wearable."},
    {"name": "Twisted Band Ring Set", "category": "rings", "price": 55, "featured": False,
     "description": "A trio of delicate rings designed to be stacked or worn separately."},
    {"name": "Crystal Solitaire Ring", "category": "rings", "price": 75, "featured": True,
     "description": "One perfect crystal on a fine band. A quiet moment of sparkle."},
    {"name": "Pearl Drop Earrings", "category": "earrings", "price": 45, "featured": True,
     "description": "Freshwater pearls swaying from a fine gold-tone hoop."},
    {"name": "Tiny Huggie Hoops", "category": "earrings", "price": 55, "featured": True,
     "description": "The small hoop you'll never take off. Comfortable, elegant, forever."},
    {"name": "Sparkle Studs", "category": "earrings", "price": 45, "featured": False,
     "description": "A little sparkle, every day. Hypoallergenic backs."},
    {"name": "Italian Bracelet", "category": "bracelets", "price": 100, "featured": True,
     "description": "Classic Italian-style link bracelet with a soft, polished finish."},
    {"name": "Clover Cuff Bangle", "category": "bracelets", "price": 80, "featured": True,
     "description": "A fine cuff bangle with a delicate clover motif — for luck and layering."},
    {"name": "Ayatul Kursi Bangle", "category": "bracelets", "price": 80, "featured": False,
     "description": "A meaningful bangle finished with an Ayatul Kursi motif."},
    {"name": "Snake Chain Bracelet", "category": "bracelets", "price": 60, "featured": False,
     "description": "A liquid-smooth snake chain that sits softly on the wrist."},
]

DEFAULT_FAQS = [
    {"question": "Where do you deliver?", "answer": "We currently deliver within Cape Town, South Africa. If you're outside Cape Town, message us on WhatsApp — we may be able to arrange a courier."},
    {"question": "How long does delivery take?", "answer": "Cape Town deliveries typically arrive within 2–4 working days after your order is confirmed."},
    {"question": "What payment methods do you accept?", "answer": "We accept EFT, cash on delivery (Cape Town), and WhatsApp-confirmed orders. Card payments are coming soon."},
    {"question": "What is the minimum order?", "answer": "Our minimum order is R100."},
    {"question": "How do I place an order?", "answer": "Add your pieces to the cart and checkout online, or send us a WhatsApp on 061 404 5481 and we'll help you order in a few messages."},
    {"question": "Can I return or exchange jewellery?", "answer": "For hygiene reasons, earrings cannot be returned. Other pieces can be exchanged within 7 days if unworn and in their original packaging."},
    {"question": "How should I care for my jewellery?", "answer": "Keep pieces away from water, perfume and lotion. Store in the pouch provided and wipe gently with a soft cloth after wear."},
]


async def seed_all():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.orders.create_index("order_number", unique=True)

    # Admin
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": new_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Jules Admin",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password")

    # Categories
    if await db.categories.count_documents({}) == 0:
        for idx, c in enumerate(DEFAULT_CATEGORIES):
            await db.categories.insert_one({
                "id": new_id(),
                "slug": slugify(c["name"]),
                "name": c["name"],
                "starting_price": c["starting_price"],
                "image_url": c["image_url"],
                "description": "",
                "order": idx,
            })
        logger.info("Seeded categories")

    # Products
    if await db.products.count_documents({}) == 0:
        for p in DEFAULT_PRODUCTS:
            imgs = PRODUCT_IMG.get(p["category"], [])
            slug_base = slugify(p["name"])
            slug = slug_base
            n = 1
            while await db.products.find_one({"slug": slug}):
                n += 1
                slug = f"{slug_base}-{n}"
            await db.products.insert_one({
                "id": new_id(),
                "slug": slug,
                "name": p["name"],
                "description": p["description"],
                "price": p["price"],
                "category": p["category"],
                "images": imgs[:3] if imgs else [],
                "stock": 12,
                "featured": p.get("featured", False),
                "sold_out": False,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            })
        logger.info("Seeded products")

    # FAQs
    if await db.faqs.count_documents({}) == 0:
        for i, f in enumerate(DEFAULT_FAQS):
            await db.faqs.insert_one({"id": new_id(), "order": i, **f})
        logger.info("Seeded FAQs")

    # Settings
    if not await db.settings.find_one({"key": "site"}):
        await db.settings.insert_one({
            "key": "site",
            "delivery_fee": 50.0,
            "min_order": 100.0,
            "whatsapp_number": os.environ.get("WHATSAPP_NUMBER", "27614045481"),
            "instagram_handle": "julesforher_",
            "tiktok_handle": "julesforher_",
            "announcement": "Cape Town deliveries available  •  Minimum order R100",
            "about_headline": "Made For Her, Chosen By Her.",
            "about_text": "Jules For Her is a Cape Town-based jewellery brand focused on beautiful, affordable pieces that let you express your style every day. From delicate necklaces to statement earrings, every piece is selected to add that little extra sparkle to your look.",
            "delivery_info": "Free packaging on every order. Cape Town delivery in 2–4 working days.",
            "returns_info": "Exchanges accepted within 7 days on unworn pieces (excluding earrings, for hygiene).",
            "care_info": "Keep away from water, perfume and lotion. Store in the pouch provided.",
        })
        logger.info("Seeded settings")


@app.on_event("startup")
async def on_startup():
    try:
        await seed_all()
    except Exception as e:
        logger.exception(f"Seed error: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@api.get("/health")
async def health():
    return {"status": "ok", "brand": "Jules For Her"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
