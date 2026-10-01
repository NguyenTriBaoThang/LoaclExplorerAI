"""Persist PRD 3.0 prompt outputs and provenance.

Revision ID: 0003_prompt_workflows
Revises: 0002_team_database_architecture
"""

import sqlalchemy as sa
from alembic import op

revision = "0003_prompt_workflows"
down_revision = "0002_team_database_architecture"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("experiences", sa.Column("primary_intent", sa.String(40), nullable=True))
    op.add_column("experiences", sa.Column("weather_sensitivity", sa.String(24), nullable=True))
    op.add_column("experiences", sa.Column("tagger_prompt_version", sa.String(20), nullable=True))

    op.add_column("intent_similarities", sa.Column("can_substitute_purpose", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("intent_similarities", sa.Column("prompt_version", sa.String(20), nullable=True))

    # Batch mode also supports the SQLite development database, which cannot
    # ALTER TABLE to add a CHECK constraint directly.
    with op.batch_alter_table("feedbacks") as batch_op:
        batch_op.add_column(sa.Column("relevance_grade", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("rubric_justification_vi", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("objective_achieved_ratio", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("is_usable_for_training", sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column("labeler_prompt_version", sa.String(20), nullable=True))
        batch_op.create_check_constraint(
            "ck_feedback_relevance_range",
            "relevance_grade IS NULL OR relevance_grade BETWEEN 0 AND 3",
        )
        batch_op.create_check_constraint(
            "ck_feedback_objective_ratio",
            "objective_achieved_ratio IS NULL OR objective_achieved_ratio BETWEEN 0 AND 1",
        )


def downgrade() -> None:
    with op.batch_alter_table("feedbacks") as batch_op:
        batch_op.drop_constraint("ck_feedback_objective_ratio", type_="check")
        batch_op.drop_constraint("ck_feedback_relevance_range", type_="check")
        for column in (
            "relevance_grade", "rubric_justification_vi", "objective_achieved_ratio",
            "is_usable_for_training", "labeler_prompt_version",
        ):
            batch_op.drop_column(column)
    for column in ("can_substitute_purpose", "prompt_version"):
        op.drop_column("intent_similarities", column)
    for column in ("primary_intent", "weather_sensitivity", "tagger_prompt_version"):
        op.drop_column("experiences", column)
