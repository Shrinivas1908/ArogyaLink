import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.database_url)
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS abha_number VARCHAR(50);"))
        await conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS abha_address VARCHAR(100);"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_patients_abha_number ON patients(abha_number);"))
    print("MIGRATION_SUCCESSFUL")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
