"""Initial Local Explorer AI schema."""

from alembic import op

from app.db.base import Base
from app.models import entities  # noqa: F401

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    Base.metadata.create_all(bind=op.get_bind())
    op.execute("ALTER TABLE pois ADD COLUMN IF NOT EXISTS geom geography(POINT, 4326)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pois_geom ON pois USING GIST (geom)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_pois_geom")
    op.execute("ALTER TABLE pois DROP COLUMN IF EXISTS geom")
    Base.metadata.drop_all(bind=op.get_bind())
