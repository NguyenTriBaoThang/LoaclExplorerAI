"""Add booking holds, payment ledger and transaction history.

Revision ID: 0007_booking_payments
Revises: 0006_provider_poi_ownership
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB


revision = "0007_booking_payments"
down_revision = "0006_provider_poi_ownership"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bookings",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("provider_id", sa.String(length=36), sa.ForeignKey("providers.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("itinerary_id", sa.String(length=36), sa.ForeignKey("itineraries.id", ondelete="SET NULL"), nullable=True),
        sa.Column("itinerary_stop_id", sa.String(length=36), sa.ForeignKey("itinerary_stops.id", ondelete="SET NULL"), nullable=True),
        sa.Column("experience_id", sa.String(length=36), sa.ForeignKey("experiences.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("slot_id", sa.String(length=36), sa.ForeignKey("experience_slots.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("amount_vnd", sa.BigInteger(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="VND"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending_provider"),
        sa.Column("hold_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("provider_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancellation_reason", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("quantity BETWEEN 1 AND 10000", name="ck_bookings_quantity_positive"),
        sa.CheckConstraint("amount_vnd >= 0", name="ck_bookings_amount_nonnegative"),
        sa.CheckConstraint(
            "status IN ('pending_provider', 'awaiting_payment', 'confirmed', 'rejected', 'cancelled', 'expired', 'cancellation_requested', 'refund_pending', 'refunded')",
            name="ck_bookings_status",
        ),
    )
    for name, column in (
        ("ix_bookings_user_id", "user_id"),
        ("ix_bookings_provider_id", "provider_id"),
        ("ix_bookings_itinerary_id", "itinerary_id"),
        ("ix_bookings_itinerary_stop_id", "itinerary_stop_id"),
        ("ix_bookings_experience_id", "experience_id"),
        ("ix_bookings_slot_id", "slot_id"),
        ("ix_bookings_status", "status"),
        ("ix_bookings_hold_expires_at", "hold_expires_at"),
        ("ix_bookings_created_at", "created_at"),
    ):
        op.create_index(name, "bookings", [column])
    op.create_index("ix_bookings_slot_status_expiry", "bookings", ["slot_id", "status", "hold_expires_at"])

    op.create_table(
        "payment_transactions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("booking_id", sa.String(length=36), sa.ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("provider", sa.String(length=40), nullable=False, server_default="unconfigured"),
        sa.Column("provider_reference", sa.String(length=255), nullable=True),
        sa.Column("idempotency_key", sa.String(length=100), nullable=False),
        sa.Column("amount_vnd", sa.BigInteger(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="VND"),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="created"),
        sa.Column("checkout_url", sa.String(length=2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("amount_vnd >= 0", name="ck_payment_amount_nonnegative"),
        sa.CheckConstraint(
            "status IN ('created', 'pending', 'succeeded', 'failed', 'refund_pending', 'refunded')",
            name="ck_payment_transaction_status",
        ),
        sa.UniqueConstraint("provider", "provider_reference", name="uq_payment_provider_reference"),
        sa.UniqueConstraint("idempotency_key", name="uq_payment_idempotency_key"),
    )
    op.create_index("ix_payment_transactions_booking_id", "payment_transactions", ["booking_id"])
    op.create_index("ix_payment_transactions_status", "payment_transactions", ["status"])

    op.create_table(
        "booking_events",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("booking_id", sa.String(length=36), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor_user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.String(length=60), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=True),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column("details", sa.JSON().with_variant(JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_booking_events_booking_id", "booking_events", ["booking_id"])
    op.create_index("ix_booking_events_actor_user_id", "booking_events", ["actor_user_id"])
    op.create_index("ix_booking_events_created_at", "booking_events", ["created_at"])
    op.create_index("ix_booking_events_booking_created", "booking_events", ["booking_id", "created_at"])


def downgrade() -> None:
    op.drop_table("booking_events")
    op.drop_table("payment_transactions")
    op.drop_table("bookings")
