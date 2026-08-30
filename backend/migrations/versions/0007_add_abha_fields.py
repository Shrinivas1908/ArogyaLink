"""0007_add_abha_fields — Add ABHA fields to patients table

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-30
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("abha_number", sa.String(length=50), nullable=True))
    op.add_column("patients", sa.Column("abha_address", sa.String(length=100), nullable=True))
    op.create_index("ix_patients_abha_number", "patients", ["abha_number"], if_not_exists=True)


def downgrade() -> None:
    op.drop_index("ix_patients_abha_number", table_name="patients", if_exists=True)
    op.drop_column("patients", "abha_address")
    op.drop_column("patients", "abha_number")
