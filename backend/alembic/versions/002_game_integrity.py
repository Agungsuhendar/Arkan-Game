"""Add GameSession and GameEvent tables for Sprint 4 Game Integrity

Revision ID: 002_game_integrity
Revises: 001_initial_schema
Create Date: 2026-08-11 23:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_game_integrity'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. game_session
    op.create_table(
        'game_session',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('child_id', sa.String(), nullable=False),
        sa.Column('level_id', sa.String(), nullable=False),
        sa.Column('session_token', sa.String(), nullable=False),
        sa.Column('status', sa.String(), server_default='active', nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('max_score', sa.Integer(), server_default='100', nullable=True),
        sa.Column('attempts_count', sa.Integer(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['child_id'], ['child.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['level_id'], ['level.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token')
    )
    op.create_index(op.f('ix_game_session_child_id'), 'game_session', ['child_id'], unique=False)
    op.create_index(op.f('ix_game_session_level_id'), 'game_session', ['level_id'], unique=False)
    op.create_index(op.f('ix_game_session_session_token'), 'game_session', ['session_token'], unique=True)
    op.create_index(op.f('ix_game_session_status'), 'game_session', ['status'], unique=False)

    # 2. game_event
    op.create_table(
        'game_event',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['game_session.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_game_event_session_id'), 'game_event', ['session_id'], unique=False)
    op.create_index(op.f('ix_game_event_event_type'), 'game_event', ['event_type'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_game_event_event_type'), table_name='game_event')
    op.drop_index(op.f('ix_game_event_session_id'), table_name='game_event')
    op.drop_table('game_event')
    op.drop_index(op.f('ix_game_session_status'), table_name='game_session')
    op.drop_index(op.f('ix_game_session_session_token'), table_name='game_session')
    op.drop_index(op.f('ix_game_session_level_id'), table_name='game_session')
    op.drop_index(op.f('ix_game_session_child_id'), table_name='game_session')
    op.drop_table('game_session')
