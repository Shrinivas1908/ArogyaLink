"""0005_red_flags_triage — Add triage fields to encounters table

Revision ID: 0005
Revises: 0004
Create Date: 2026-08-28
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "encounters",
        sa.Column("triage_level", sa.String(length=50), server_default="ROUTINE", nullable=False),
    )
    op.add_column(
        "encounters",
        sa.Column("red_flags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "encounters",
        sa.Column("triaged_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_encounters_triage_level", "encounters", ["triage_level"])


def downgrade() -> None:
    op.drop_index("ix_encounters_triage_level", table_name="encounters")
    op.drop_column("encounters", "triaged_at")
    op.drop_column("encounters", "red_flags")
    op.drop_column("encounters", "triage_level")
