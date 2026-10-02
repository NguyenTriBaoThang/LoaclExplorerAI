"""Add authenticated accounts, share links and audit history.

Revision ID: 0004_accounts_and_roles
Revises: 0003_prompt_workflows
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision = "0004_accounts_and_roles"
down_revision = "0003_prompt_workflows"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("display_name", sa.String(length=180), nullable=False, server_default=""),
        sa.Column("password_hash", sa.String(length=256), nullable=True),
        sa.Column("google_sub", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=24), nullable=False, server_default="traveler"),
        sa.Column("provider_id", sa.String(length=36), sa.ForeignKey("providers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("google_sub", name="uq_users_google_sub"),
        sa.CheckConstraint("role IN ('traveler', 'provider', 'admin')", name="ck_users_role"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_users_provider_id", "users", ["provider_id"], unique=False)

    with op.batch_alter_table("itineraries") as batch:
        batch.add_column(sa.Column("user_id", sa.String(length=36), nullable=True))
        batch.add_column(sa.Column("share_token", sa.String(length=64), nullable=True))
        batch.add_column(sa.Column("origin_latitude", sa.Float(), nullable=True))
        batch.add_column(sa.Column("origin_longitude", sa.Float(), nullable=True))
        batch.add_column(sa.Column("destination_latitude", sa.Float(), nullable=True))
        batch.add_column(sa.Column("destination_longitude", sa.Float(), nullable=True))
        batch.create_foreign_key("fk_itineraries_user_id_users", "users", ["user_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_itineraries_user_id", "itineraries", ["user_id"], unique=False)
    op.create_index("ix_itineraries_share_token", "itineraries", ["share_token"], unique=True)

    with op.batch_alter_table("feedbacks") as batch:
        batch.add_column(sa.Column("user_id", sa.String(length=36), nullable=True))
        batch.create_foreign_key("fk_feedbacks_user_id_users", "users", ["user_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_feedbacks_user_id", "feedbacks", ["user_id"], unique=False)

    with op.batch_alter_table("evidence") as batch:
        batch.add_column(sa.Column("verification_status", sa.String(length=24), nullable=False, server_default="pending"))
        batch.add_column(sa.Column("reviewed_by", sa.String(length=36), nullable=True))
        batch.add_column(sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_evidence_verification_status", "evidence", ["verification_status"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("actor_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("target_type", sa.String(length=40), nullable=False),
        sa.Column("target_id", sa.String(length=36), nullable=False),
        sa.Column("details", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    for column in ("actor_id", "action", "target_type", "target_id", "created_at"):
        op.create_index(f"ix_audit_logs_{column}", "audit_logs", [column], unique=False)


def downgrade() -> None:
    for column in ("created_at", "target_id", "target_type", "action", "actor_id"):
        op.drop_index(f"ix_audit_logs_{column}", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_evidence_verification_status", table_name="evidence")
    with op.batch_alter_table("evidence") as batch:
        batch.drop_column("reviewed_at")
        batch.drop_column("reviewed_by")
        batch.drop_column("verification_status")
    op.drop_index("ix_feedbacks_user_id", table_name="feedbacks")
    with op.batch_alter_table("feedbacks") as batch:
        batch.drop_constraint("fk_feedbacks_user_id_users", type_="foreignkey")
        batch.drop_column("user_id")
    op.drop_index("ix_itineraries_share_token", table_name="itineraries")
    op.drop_index("ix_itineraries_user_id", table_name="itineraries")
    with op.batch_alter_table("itineraries") as batch:
        batch.drop_constraint("fk_itineraries_user_id_users", type_="foreignkey")
        batch.drop_column("share_token")
        batch.drop_column("user_id")
        batch.drop_column("origin_latitude")
        batch.drop_column("origin_longitude")
        batch.drop_column("destination_latitude")
        batch.drop_column("destination_longitude")
    for column in ("provider_id", "role", "email"):
        op.drop_index(f"ix_users_{column}", table_name="users")
    op.drop_table("users")
