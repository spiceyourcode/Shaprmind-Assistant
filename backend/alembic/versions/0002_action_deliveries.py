"""add action_deliveries table

Revision ID: 0002
Revises: 0001
Create Date: 2026-02-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "action_deliveries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action_type", sa.String(length=50), nullable=False),
        sa.Column("target", sa.String(length=255)),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("last_error", sa.String(length=512)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(["call_id"], ["calls.id"]),
    )


def downgrade() -> None:
    op.drop_table("action_deliveries")
