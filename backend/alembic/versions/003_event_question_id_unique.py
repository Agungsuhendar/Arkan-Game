"""Add question_id and unique constraint uq_game_event_session_question

Revision ID: 003_event_question_id_unique
Revises: 002_game_integrity
Create Date: 2026-08-12 06:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '003_event_question_id_unique'
down_revision: Union[str, None] = '002_game_integrity'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('game_event', sa.Column('question_id', sa.String(), nullable=True))
    op.create_index(op.f('ix_game_event_question_id'), 'game_event', ['question_id'], unique=False)
    op.create_unique_constraint('uq_game_event_session_question', 'game_event', ['session_id', 'question_id'])


def downgrade() -> None:
    op.drop_constraint('uq_game_event_session_question', 'game_event', type_='unique')
    op.drop_index(op.f('ix_game_event_question_id'), table_name='game_event')
    op.drop_column('game_event', 'question_id')
