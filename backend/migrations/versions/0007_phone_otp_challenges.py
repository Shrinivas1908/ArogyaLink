"""0007_phone_otp_challenges - Add secure phone OTP challenge storage"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "phone_otp_challenges",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("otp_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )
    op.create_index("ix_phone_otp_challenges_phone", "phone_otp_challenges", ["phone"])
    # OTP challenges are accessed by the backend service role only.
    op.execute("ALTER TABLE public.phone_otp_challenges ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    op.execute("ALTER TABLE public.phone_otp_challenges DISABLE ROW LEVEL SECURITY;")
    op.drop_index("ix_phone_otp_challenges_phone", table_name="phone_otp_challenges")
    op.drop_table("phone_otp_challenges")