"""Initial Local Explorer AI schema."""

import sqlalchemy as sa
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

# Keep historical migrations independent from the live ORM metadata. Otherwise a
# new model field would silently appear in 0001 and make later migrations fail.
metadata = sa.MetaData()
providers = sa.Table(
    "providers", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("name", sa.String(180), nullable=False),
    sa.Column("description", sa.Text(), nullable=False, server_default=""),
    sa.Column("contact_phone", sa.String(40)),
    sa.Column("contact_email", sa.String(254)),
    sa.Column("status", sa.String(24), nullable=False, server_default="active"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
)
pois = sa.Table(
    "pois", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("name", sa.String(180), nullable=False),
    sa.Column("description", sa.Text(), nullable=False, server_default=""),
    sa.Column("latitude", sa.Float(), nullable=False),
    sa.Column("longitude", sa.Float(), nullable=False),
    sa.Column("category", sa.String(40), nullable=False),
    sa.Column("address", sa.String(300), nullable=False, server_default=""),
    sa.Column("verification_status", sa.String(24), nullable=False, server_default="simulated"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
)
experiences = sa.Table(
    "experiences", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("poi_id", sa.String(36), sa.ForeignKey("pois.id", ondelete="CASCADE"), nullable=False),
    sa.Column("provider_id", sa.String(36), sa.ForeignKey("providers.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("name", sa.String(180), nullable=False),
    sa.Column("description", sa.Text(), nullable=False, server_default=""),
    sa.Column("intent_tags", sa.JSON(), nullable=False),
    sa.Column("duration_min", sa.Integer(), nullable=False),
    sa.Column("indoor", sa.Boolean(), nullable=False, server_default=sa.true()),
    sa.Column("price_basis", sa.String(24), nullable=False, server_default="per_person"),
    sa.Column("price_vnd", sa.Integer(), nullable=False, server_default="0"),
    sa.Column("verification_status", sa.String(24), nullable=False, server_default="simulated"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
)
experience_slots = sa.Table(
    "experience_slots", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("experience_id", sa.String(36), sa.ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False),
    sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("capacity_total", sa.Integer()),
    sa.Column("available_reported", sa.Integer()),
    sa.Column("confirmed_at", sa.DateTime(timezone=True)),
    sa.Column("expires_at", sa.DateTime(timezone=True)),
    sa.Column("status", sa.String(24), nullable=False, server_default="tentative"),
    sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    sa.UniqueConstraint("experience_id", "start_at", name="uq_slot_experience_start"),
)
itineraries = sa.Table(
    "itineraries", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    sa.Column("group_size", sa.Integer(), nullable=False),
    sa.Column("budget_vnd", sa.Integer(), nullable=False),
    sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("status", sa.String(24), nullable=False, server_default="draft"),
    sa.Column("constraints", sa.JSON(), nullable=False),
    sa.Column("estimated_cost_vnd", sa.Integer(), nullable=False, server_default="0"),
    sa.Column("data_mode", sa.String(24), nullable=False, server_default="simulated"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
)
itinerary_stops = sa.Table(
    "itinerary_stops", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("itinerary_id", sa.String(36), sa.ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False),
    sa.Column("experience_id", sa.String(36), sa.ForeignKey("experiences.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("slot_id", sa.String(36), sa.ForeignKey("experience_slots.id", ondelete="RESTRICT"), nullable=False),
    sa.Column("position", sa.Integer(), nullable=False),
    sa.Column("arrival_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("cost_vnd", sa.Integer(), nullable=False),
    sa.Column("locked", sa.Boolean(), nullable=False, server_default=sa.false()),
)
evidence = sa.Table(
    "evidence", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("source_uri", sa.String(1000), nullable=False),
    sa.Column("source_type", sa.String(40), nullable=False),
    sa.Column("license", sa.String(120)),
    sa.Column("verified_by", sa.String(180)),
    sa.Column("verified_at", sa.DateTime(timezone=True)),
    sa.Column("valid_from", sa.DateTime(timezone=True)),
    sa.Column("expires_at", sa.DateTime(timezone=True)),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
)
decision_logs = sa.Table(
    "decision_logs", metadata,
    sa.Column("id", sa.String(36), primary_key=True),
    sa.Column("itinerary_id", sa.String(36), sa.ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False),
    sa.Column("snapshot_id", sa.String(36)),
    sa.Column("reason_codes", sa.JSON(), nullable=False),
    sa.Column("rejected_candidates", sa.JSON(), nullable=False),
    sa.Column("model_version", sa.String(80), nullable=False, server_default="heuristic-v1"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
)

for table_name, column_name in (
    ("pois", "name"), ("pois", "category"), ("experiences", "poi_id"),
    ("experiences", "provider_id"), ("experiences", "name"),
    ("experience_slots", "experience_id"), ("experience_slots", "start_at"),
    ("itinerary_stops", "itinerary_id"), ("itinerary_stops", "experience_id"),
    ("itinerary_stops", "slot_id"), ("decision_logs", "itinerary_id"),
):
    sa.Index(f"ix_{table_name}_{column_name}", metadata.tables[table_name].c[column_name])


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    metadata.create_all(bind=op.get_bind())
    op.execute("ALTER TABLE pois ADD COLUMN IF NOT EXISTS geom geography(POINT, 4326)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_pois_geom ON pois USING GIST (geom)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_pois_geom")
    op.execute("ALTER TABLE pois DROP COLUMN IF EXISTS geom")
    metadata.drop_all(bind=op.get_bind())
