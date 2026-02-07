"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-02-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "businesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=False, unique=True),
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_businesses_owner_user_id", "businesses", ["owner_user_id"])

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("phone", sa.String(length=32)),
        sa.Column("push_token", sa.String(length=512)),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"]),
    )

    op.create_table(
        "knowledge_bases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("embedding", Vector(1536)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"]),
    )
    op.create_index("ix_kb_business_id", "knowledge_bases", ["business_id"])
    op.create_index("ix_kb_business_category", "knowledge_bases", ["business_id", "category"])

    op.create_table(
        "escalation_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword_or_phrase", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=30), nullable=False),
        sa.Column("notify_user_ids", postgresql.ARRAY(postgresql.UUID(as_uuid=True))),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"]),
    )
    op.create_index("ix_escalation_business_id", "escalation_rules", ["business_id"])

    op.create_table(
        "calls",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("caller_number", sa.String(length=32), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        sa.Column("duration_seconds", sa.Integer()),
        sa.Column("status", sa.String(length=20)),
        sa.Column("transcript", sa.Text()),
        sa.Column("summary", sa.Text()),
        sa.Column("action_points", postgresql.JSONB()),
        sa.Column("audio_url", sa.String(length=1024)),
        sa.Column("escalated_to_user_id", postgresql.UUID(as_uuid=True)),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"]),
    )
    op.create_index("ix_calls_business_id", "calls", ["business_id"])
    op.create_index("ix_calls_caller_number", "calls", ["caller_number"])
    op.create_index("ix_calls_started_at", "calls", ["started_at"])

    op.create_table(
        "call_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True)),
        sa.Column("event_type", sa.String(length=255), nullable=False),
        sa.Column("details", postgresql.JSONB()),
        sa.ForeignKeyConstraint(["call_id"], ["calls.id"]),
    )

    op.create_table(
        "call_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sender", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True)),
        sa.Column("sentiment_score", sa.Float()),
        sa.ForeignKeyConstraint(["call_id"], ["calls.id"]),
    )
    op.create_index("ix_call_messages_call_id", "call_messages", ["call_id"])

    op.create_table(
        "customer_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("caller_number", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=255)),
        sa.Column("preferences", postgresql.JSONB()),
        sa.Column("history", postgresql.JSONB()),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"]),
    )
    op.create_index("ix_customer_profiles_business_id", "customer_profiles", ["business_id"])
    op.create_index("ix_customer_profiles_caller_number", "customer_profiles", ["caller_number"])


def downgrade() -> None:
    op.drop_index("ix_customer_profiles_caller_number", table_name="customer_profiles")
    op.drop_index("ix_customer_profiles_business_id", table_name="customer_profiles")
    op.drop_table("customer_profiles")

    op.drop_index("ix_call_messages_call_id", table_name="call_messages")
    op.drop_table("call_messages")
    op.drop_table("call_events")

    op.drop_index("ix_calls_started_at", table_name="calls")
    op.drop_index("ix_calls_caller_number", table_name="calls")
    op.drop_index("ix_calls_business_id", table_name="calls")
    op.drop_table("calls")

    op.drop_index("ix_escalation_business_id", table_name="escalation_rules")
    op.drop_table("escalation_rules")

    op.drop_index("ix_kb_business_id", table_name="knowledge_bases")
    op.drop_table("knowledge_bases")

    op.drop_table("users")
    op.drop_index("ix_businesses_owner_user_id", table_name="businesses")
    op.drop_table("businesses")
