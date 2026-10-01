import importlib.util
from pathlib import Path

from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, inspect


MIGRATION_PATH = Path(__file__).parents[1] / "migrations" / "versions" / "0003_prompt_workflows.py"
SPEC = importlib.util.spec_from_file_location("prompt_workflow_migration", MIGRATION_PATH)
MIGRATION = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MIGRATION)


def test_prompt_workflow_migration_round_trips_on_sqlite():
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.exec_driver_sql("CREATE TABLE experiences (id VARCHAR(36) PRIMARY KEY)")
        connection.exec_driver_sql("CREATE TABLE intent_similarities (experience_a_id VARCHAR(36), experience_b_id VARCHAR(36), semantic_similarity FLOAT, tag_overlap_score FLOAT, final_score FLOAT, PRIMARY KEY (experience_a_id, experience_b_id))")
        connection.exec_driver_sql("CREATE TABLE feedbacks (id VARCHAR(36) PRIMARY KEY, itinerary_id VARCHAR(36), rating INTEGER, comment TEXT, created_at DATETIME)")
        context = MigrationContext.configure(connection)
        with Operations.context(context):
            MIGRATION.upgrade()
        columns = {column["name"] for column in inspect(connection).get_columns("feedbacks")}
        assert {"relevance_grade", "rubric_justification_vi", "objective_achieved_ratio",
                "is_usable_for_training", "labeler_prompt_version"}.issubset(columns)
        assert {item["name"] for item in inspect(connection).get_check_constraints("feedbacks")} == {
            "ck_feedback_relevance_range", "ck_feedback_objective_ratio"
        }
        with Operations.context(context):
            MIGRATION.downgrade()
        assert "relevance_grade" not in {column["name"] for column in inspect(connection).get_columns("feedbacks")}
    engine.dispose()
