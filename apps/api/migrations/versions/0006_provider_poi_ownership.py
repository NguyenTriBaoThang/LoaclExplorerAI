"""Track POIs submitted by provider accounts.

Revision ID: 0006_provider_poi_ownership
Revises: 0005_sourced_catalog_evidence
"""

import sqlalchemy as sa
from alembic import op


revision = "0006_provider_poi_ownership"
down_revision = "0005_sourced_catalog_evidence"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("pois") as batch:
        batch.add_column(sa.Column(
            "submitted_by_provider_id",
            sa.String(length=36),
            sa.ForeignKey("providers.id", ondelete="SET NULL"),
            nullable=True,
        ))
        batch.create_index("ix_pois_submitted_by_provider_id", ["submitted_by_provider_id"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("pois") as batch:
        batch.drop_index("ix_pois_submitted_by_provider_id")
        batch.drop_column("submitted_by_provider_id")
