"""
Arogya Link — migrations/env.py
=================================
Alembic async migration environment.
Reads DATABASE_URL from environment / .env via app.core.config so the
connection string is never hard-coded.

Per Phase 0 plan:
  Initialize Alembic for migrations with an autogenerate-friendly env.py
  pointed at the SQLAlchemy metadata.
  Create migration 0001_init establishing database/schema/extensions baseline
  (uuid-ossp for UUID primary keys).
"""

from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

# Ensure the backend root is on sys.path so `app` package is importable
sys.path.insert(0, str(Path(__file__).parents[1]))

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Import all models so Alembic autogenerate sees them
from app.models import Base  # noqa: F401 — registers all model metadata
from app.core.config import settings

# Alembic Config object
config = context.config

# Set the sqlalchemy.url from our Settings (overrides alembic.ini value)
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no DB connection needed)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using an async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
