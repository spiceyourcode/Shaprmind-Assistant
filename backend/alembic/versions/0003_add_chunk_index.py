"""add chunk_index to knowledge_bases

Revision ID: 0003
Revises: 0002
Create Date: 2026-02-12

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add chunk_index column to knowledge_bases table
    op.add_column('knowledge_bases', sa.Column('chunk_index', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove chunk_index column from knowledge_bases table
    op.drop_column('knowledge_bases', 'chunk_index')
