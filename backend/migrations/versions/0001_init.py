"""0001_init — Database/schema/extensions baseline

Revision ID: 0001
Revises:
Create Date: 2026-08-27

Per Phase 0 plan:
  Create migration 0001_init establishing the database/schema/extensions
  baseline (uuid-ossp or pgcrypto for UUID primary keys used throughout
  later phases).
"""

from __future__ import annotations

from alembic import op

# revision identifiers
revision: str = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable uuid-ossp extension for gen_random_uuid() / uuid_generate_v4()
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')


def downgrade() -> None:
    op.execute('DROP EXTENSION IF EXISTS "pgcrypto"')
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
