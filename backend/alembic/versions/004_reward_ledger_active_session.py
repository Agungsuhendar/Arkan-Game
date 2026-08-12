"""reward_ledger_and_active_session_guard

Revision ID: 004_reward_ledger_active_session
Revises: 003_event_question_id_unique
Create Date: 2026-08-12
"""
from alembic import op
import sqlalchemy as sa

revision = '004_reward_ledger_active_session'
down_revision = '003_event_question_id_unique'
branch_labels = None
depends_on = None

def upgrade():
    # Create reward_ledger table with session_id UNIQUE constraint
    op.create_table(
        'reward_ledger',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('session_id', sa.String(), sa.ForeignKey('game_session.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('child_id', sa.String(), sa.ForeignKey('child.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('coins', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('stars', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('reason', sa.String(), nullable=False, server_default='game_completion'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('session_id', name='uq_reward_ledger_session')
    )

    # Partial unique index: 1 child + 1 level = 1 active session
    # PostgreSQL partial index: only rows WHERE status = 'active' are indexed
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS uq_game_session_child_level_active
        ON game_session (child_id, level_id)
        WHERE status = 'active'
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS uq_game_session_child_level_active")
    op.drop_table('reward_ledger')
