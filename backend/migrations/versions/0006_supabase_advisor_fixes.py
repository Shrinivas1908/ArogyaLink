"""0006_supabase_advisor_fixes — Enable RLS and scoped policies on all tables

Revision ID: 0006
Revises: 0005
Create Date: 2026-08-28
"""

from __future__ import annotations

from alembic import op


# revision identifiers
revision: str = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Foreign Key Index on encounters.patient_id
    op.create_index(
        "ix_encounters_patient_id",
        "encounters",
        ["patient_id"],
        if_not_exists=True,
    )

    # 2. Enable RLS on all tables
    tables = ["patients", "encounters", "consent", "answers", "staff_profiles"]
    for table in tables:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")

    # 3. Staff Profiles Policies
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_profiles' AND policyname = 'authenticated_staff_read') THEN
                CREATE POLICY "authenticated_staff_read" ON public.staff_profiles
                    FOR SELECT TO authenticated
                    USING ((SELECT auth.uid()) IS NOT NULL);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'staff_profiles' AND policyname = 'staff_manage_own_profile') THEN
                CREATE POLICY "staff_manage_own_profile" ON public.staff_profiles
                    FOR ALL TO authenticated
                    USING ((SELECT auth.uid()) = id)
                    WITH CHECK ((SELECT auth.uid()) = id);
            END IF;
        END $$;
    """)

    # 4. Clinical Tables Policies (authenticated staff access)
    for table in ["patients", "encounters", "consent", "answers"]:
        policy_name = f"authenticated_{table}_access"
        op.execute(f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '{table}' AND policyname = '{policy_name}') THEN
                    CREATE POLICY "{policy_name}" ON public.{table}
                        FOR ALL TO authenticated
                        USING ((SELECT auth.uid()) IS NOT NULL)
                        WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
                END IF;
            END $$;
        """)

    # 5. Alembic Version Policy
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alembic_version') THEN
                EXECUTE 'ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY;';
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alembic_version' AND policyname = 'alembic_version_internal_only') THEN
                    EXECUTE 'CREATE POLICY "alembic_version_internal_only" ON public.alembic_version FOR ALL TO authenticated USING (false);';
                END IF;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    for table in ["patients", "encounters", "consent", "answers"]:
        op.execute(f'DROP POLICY IF EXISTS "authenticated_{table}_access" ON public.{table};')
        op.execute(f"ALTER TABLE public.{table} DISABLE ROW LEVEL SECURITY;")

    op.execute('DROP POLICY IF EXISTS "authenticated_staff_read" ON public.staff_profiles;')
    op.execute('DROP POLICY IF EXISTS "staff_manage_own_profile" ON public.staff_profiles;')
    op.execute('ALTER TABLE public.staff_profiles DISABLE ROW LEVEL SECURITY;')

    op.execute('DROP POLICY IF EXISTS "alembic_version_internal_only" ON public.alembic_version;')
    op.execute('ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY;')

    op.drop_index("ix_encounters_patient_id", table_name="encounters", if_exists=True)
