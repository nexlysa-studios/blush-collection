"""Copy all shop data from the current MongoDB into Supabase Postgres.
Usage: MONGO_URL=... DB_NAME=... DATABASE_URL=... python scripts/migrate_to_supabase.py
Existing rows in Supabase are replaced.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from pgdb import PgDatabase, COLLECTIONS  # noqa: E402


async def main():
    mongo = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    pg = PgDatabase(os.environ["DATABASE_URL"])
    for name in COLLECTIONS:
        docs = await mongo[name].find({}, {"_id": 0}).to_list(None)
        target = getattr(pg, name)
        await target.delete_many({})
        for d in docs:
            await target.insert_one(d)
        print(f"{name}: {len(docs)} copied")
    await pg.aclose()


asyncio.run(main())
