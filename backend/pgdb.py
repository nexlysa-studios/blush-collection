"""Minimal Mongo-style async adapter over Postgres JSONB (used for Supabase)."""
import json
import re
import asyncpg

_OPS = {"$gt": ">", "$gte": ">=", "$lt": "<", "$lte": "<="}
_NAME = re.compile(r"^[a-z_][a-z0-9_]*$")


def _check(name: str) -> str:
    if not _NAME.match(name):
        raise ValueError(f"Invalid identifier: {name}")
    return name


def _where(q: dict, args: list) -> str:
    parts = []
    for k, v in (q or {}).items():
        _check(k)
        if isinstance(v, dict) and v and all(op in _OPS for op in v):
            for op, val in v.items():
                args.append(val)
                parts.append(f"(doc->>'{k}')::numeric {_OPS[op]} ${len(args)}")
        else:
            args.append(json.dumps(v))
            parts.append(f"doc->'{k}' = ${len(args)}::jsonb")
    return " AND ".join(parts) if parts else "TRUE"


def _apply(doc: dict, update: dict, inserting: bool) -> dict:
    doc = dict(doc)
    doc.update(update.get("$set", {}))
    for k, v in update.get("$inc", {}).items():
        doc[k] = (doc.get(k) or 0) + v
    if inserting:
        for k, v in update.get("$setOnInsert", {}).items():
            doc.setdefault(k, v)
    return doc


class _Cursor:
    def __init__(self, coll, q):
        self.coll, self.q, self.order = coll, q, ""

    def sort(self, field, direction=1):
        self.order = f" ORDER BY doc->'{_check(field)}' {'DESC' if direction == -1 else 'ASC'}"
        return self

    async def to_list(self, length=None):
        args = []
        sql = f"SELECT doc FROM {self.coll.name} WHERE {_where(self.q, args)}{self.order}"
        if length:
            sql += f" LIMIT {int(length)}"
        rows = await (await self.coll.db.pool()).fetch(sql, *args)
        return [json.loads(r["doc"]) for r in rows]


class _Collection:
    def __init__(self, db, name):
        self.db, self.name = db, _check(name)

    async def _ensure(self, conn):
        await conn.execute(f"CREATE TABLE IF NOT EXISTS {self.name} (pk BIGSERIAL PRIMARY KEY, doc JSONB NOT NULL)")

    def find(self, q=None, projection=None):
        return _Cursor(self, q or {})

    async def find_one(self, q=None, projection=None):
        rows = await _Cursor(self, q or {}).to_list(1)
        return rows[0] if rows else None

    async def insert_one(self, doc):
        clean = {k: v for k, v in doc.items() if k != "_id"}
        await (await self.db.pool()).execute(f"INSERT INTO {self.name} (doc) VALUES ($1::jsonb)", json.dumps(clean))

    async def update_one(self, q, update, upsert=False):
        pool = await self.db.pool()
        async with pool.acquire() as conn, conn.transaction():
            args = []
            row = await conn.fetchrow(
                f"SELECT pk, doc FROM {self.name} WHERE {_where(q, args)} LIMIT 1 FOR UPDATE", *args)
            if row:
                new = _apply(json.loads(row["doc"]), update, False)
                await conn.execute(f"UPDATE {self.name} SET doc = $1::jsonb WHERE pk = $2", json.dumps(new), row["pk"])
            elif upsert:
                base = {k: v for k, v in q.items() if not isinstance(v, dict)}
                await conn.execute(f"INSERT INTO {self.name} (doc) VALUES ($1::jsonb)", json.dumps(_apply(base, update, True)))

    async def delete_one(self, q):
        args = []
        await (await self.db.pool()).execute(
            f"DELETE FROM {self.name} WHERE pk = (SELECT pk FROM {self.name} WHERE {_where(q, args)} LIMIT 1)", *args)

    async def delete_many(self, q):
        args = []
        await (await self.db.pool()).execute(f"DELETE FROM {self.name} WHERE {_where(q, args)}", *args)

    async def count_documents(self, q):
        args = []
        return await (await self.db.pool()).fetchval(f"SELECT COUNT(*) FROM {self.name} WHERE {_where(q, args)}", *args)

    async def create_index(self, field, unique=False):
        _check(field)
        kind = "UNIQUE INDEX" if unique else "INDEX"
        await (await self.db.pool()).execute(
            f"CREATE {kind} IF NOT EXISTS {self.name}_{field}_idx ON {self.name} ((doc->>'{field}'))")


COLLECTIONS = ["users", "categories", "products", "orders", "customers", "faqs", "settings", "contact_messages"]


class PgDatabase:
    def __init__(self, dsn: str):
        self.dsn, self._pool = dsn, None
        for name in COLLECTIONS:
            setattr(self, name, _Collection(self, name))

    async def pool(self):
        if self._pool is None:
            # statement_cache_size=0 keeps Supabase's connection pooler happy
            self._pool = await asyncpg.create_pool(self.dsn, min_size=1, max_size=5, statement_cache_size=0)
            async with self._pool.acquire() as conn:
                for name in COLLECTIONS:
                    await getattr(self, name)._ensure(conn)
        return self._pool

    async def aclose(self):
        if self._pool:
            await self._pool.close()
