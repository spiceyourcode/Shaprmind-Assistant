"""fix action_delivery enum

Revision ID: 0004
Revises: 0003
Create Date: 2026-02-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create the enum type
    status_enum = postgresql.ENUM('pending', 'success', 'failed', name='actiondeliverystatus')
    status_enum.create(op.get_bind())
    
    # Alter the column to use the new enum type
    # We use 'USING status::actiondeliverystatus' to cast existing data
    op.execute('ALTER TABLE action_deliveries ALTER COLUMN status TYPE actiondeliverystatus USING status::actiondeliverystatus')

def downgrade() -> None:
    # Alter the column back to varchar
    op.execute('ALTER TABLE action_deliveries ALTER COLUMN status TYPE VARCHAR(20)')
    
    # Drop the enum type
    op.execute('DROP TYPE actiondeliverystatus')
