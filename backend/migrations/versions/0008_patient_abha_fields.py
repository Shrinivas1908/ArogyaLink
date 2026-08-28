"""0008_patient_abha_fields - Add ABHA identity fields used by Patient."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("abha_number", sa.String(length=50), nullable=True))
    op.add_column("patients", sa.Column("abha_address", sa.String(length=100), nullable=True))
    op.create_index("ix_patients_abha_number", "patients", ["abha_number"])


def downgrade() -> None:
    op.drop_index("ix_patients_abha_number", table_name="patients")
    op.drop_column("patients", "abha_address")
    op.drop_column("patients", "abha_number")