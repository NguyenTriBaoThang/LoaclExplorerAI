"""Attach expiring, field-scoped evidence to catalog records.

Revision ID: 0005_sourced_catalog_evidence
Revises: 0004_accounts_and_roles
"""

import sqlalchemy as sa
from alembic import op


revision = "0005_sourced_catalog_evidence"
down_revision = "0004_accounts_and_roles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("pois") as batch:
        batch.add_column(sa.Column("data_revision", sa.Integer(), nullable=False, server_default="1"))
    with op.batch_alter_table("experiences") as batch:
        batch.add_column(sa.Column("data_revision", sa.Integer(), nullable=False, server_default="1"))
    with op.batch_alter_table("evidence") as batch:
        batch.add_column(sa.Column("source_label", sa.String(length=180), nullable=True))
        batch.add_column(sa.Column("notes", sa.Text(), nullable=False, server_default=""))
        batch.add_column(sa.Column("submitted_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
        batch.add_column(sa.Column("target_type", sa.String(length=24), nullable=True))
        batch.add_column(sa.Column("target_id", sa.String(length=36), nullable=True))
        batch.add_column(sa.Column("target_revision", sa.Integer(), nullable=False, server_default="1"))
        batch.add_column(sa.Column("fields_covered", sa.JSON(), nullable=False, server_default="[]"))
        batch.add_column(sa.Column("observed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_evidence_target_type", "evidence", ["target_type"], unique=False)
    op.create_index("ix_evidence_target_id", "evidence", ["target_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_evidence_target_id", table_name="evidence")
    op.drop_index("ix_evidence_target_type", table_name="evidence")
    with op.batch_alter_table("evidence") as batch:
        batch.drop_column("observed_at")
        batch.drop_column("fields_covered")
        batch.drop_column("target_revision")
        batch.drop_column("target_id")
        batch.drop_column("target_type")
        batch.drop_column("submitted_by")
        batch.drop_column("notes")
        batch.drop_column("source_label")
    with op.batch_alter_table("experiences") as batch:
        batch.drop_column("data_revision")
    with op.batch_alter_table("pois") as batch:
        batch.drop_column("data_revision")
