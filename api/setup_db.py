#!/usr/bin/env python3
"""
Database setup script.
Applies schema.sql to Supabase database.
"""

import asyncio

import asyncpg

from app.core import get_settings


async def setup_database():
    """Apply schema to database."""
    settings = get_settings()

    print("Connecting to database...")
    conn = await asyncpg.connect(settings.database_url)

    try:
        print("Reading schema.sql...")
        with open("schema.sql") as f:
            schema = f.read()

        print("Applying schema...")
        await conn.execute(schema)

        print("✅ Database schema applied successfully!")

    except Exception as e:
        print(f"❌ Error applying schema: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(setup_database())
