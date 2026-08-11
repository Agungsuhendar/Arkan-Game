"""Initial Schema Creation

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-11 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), server_default='parent', nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. parent
    op.create_table(
        'parent',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('pin_code', sa.String(), server_default='1234', nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_parent_user_id'), 'parent', ['user_id'], unique=False)

    # 3. child
    op.create_table(
        'child',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('parent_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), server_default='Arkan', nullable=False),
        sa.Column('age', sa.Integer(), server_default='5', nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('level', sa.Integer(), server_default='1', nullable=True),
        sa.Column('xp', sa.Integer(), server_default='0', nullable=True),
        sa.Column('coins', sa.Integer(), server_default='100', nullable=True),
        sa.Column('diamonds', sa.Integer(), server_default='10', nullable=True),
        sa.Column('energy', sa.Integer(), server_default='100', nullable=True),
        sa.Column('hearts', sa.Integer(), server_default='5', nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['parent.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_child_parent_id'), 'child', ['parent_id'], unique=False)

    # 4. world
    op.create_table(
        'world',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('boss_name', sa.String(), nullable=True),
        sa.Column('npc_name', sa.String(), nullable=True),
        sa.Column('icon_asset', sa.String(), nullable=False),
        sa.Column('bg_asset', sa.String(), nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='1', nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 5. chapter
    op.create_table(
        'chapter',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('world_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['world_id'], ['world.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('world_id', 'order_index', name='uq_chapter_world_order')
    )
    op.create_index(op.f('ix_chapter_world_id'), 'chapter', ['world_id'], unique=False)

    # 6. game_engine
    op.create_table(
        'game_engine',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('engine_type', sa.String(), nullable=False),
        sa.Column('default_config', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 7. level
    op.create_table(
        'level',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('chapter_id', sa.String(), nullable=False),
        sa.Column('engine_id', sa.String(), nullable=False),
        sa.Column('level_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('reward_coins', sa.Integer(), server_default='10', nullable=True),
        sa.Column('reward_xp', sa.Integer(), server_default='25', nullable=True),
        sa.Column('config_override', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapter.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['engine_id'], ['game_engine.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('chapter_id', 'level_number', name='uq_level_chapter_number')
    )
    op.create_index(op.f('ix_level_chapter_id'), 'level', ['chapter_id'], unique=False)
    op.create_index(op.f('ix_level_engine_id'), 'level', ['engine_id'], unique=False)

    # 8. question
    op.create_table(
        'question',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('level_id', sa.String(), nullable=False),
        sa.Column('prompt_text', sa.Text(), nullable=False),
        sa.Column('prompt_audio', sa.String(), nullable=True),
        sa.Column('category', sa.String(), server_default='huruf', nullable=True),
        sa.Column('difficulty', sa.Integer(), server_default='1', nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['level_id'], ['level.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_level_id'), 'question', ['level_id'], unique=False)
    op.create_index(op.f('ix_question_category'), 'question', ['category'], unique=False)

    # 9. question_option
    op.create_table(
        'question_option',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('question_id', sa.String(), nullable=False),
        sa.Column('option_text', sa.String(), nullable=False),
        sa.Column('option_asset', sa.String(), nullable=True),
        sa.Column('is_correct', sa.Boolean(), server_default='false', nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['question.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_option_question_id'), 'question_option', ['question_id'], unique=False)

    # 10. progress
    op.create_table(
        'progress',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('child_id', sa.String(), nullable=False),
        sa.Column('level_id', sa.String(), nullable=False),
        sa.Column('stars', sa.Integer(), server_default='0', nullable=True),
        sa.Column('score', sa.Integer(), server_default='0', nullable=True),
        sa.Column('time_spent_seconds', sa.Integer(), server_default='0', nullable=True),
        sa.Column('category', sa.String(), server_default='huruf', nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['child_id'], ['child.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['level_id'], ['level.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('child_id', 'level_id', name='uq_progress_child_level')
    )
    op.create_index(op.f('ix_progress_child_id'), 'progress', ['child_id'], unique=False)
    op.create_index(op.f('ix_progress_level_id'), 'progress', ['level_id'], unique=False)

    # 11. avatar_items
    op.create_table(
        'avatar_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('asset_path', sa.String(), nullable=False),
        sa.Column('price_coins', sa.Integer(), server_default='50', nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 12. pet
    op.create_table(
        'pet',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), server_default='Dino', nullable=False),
        sa.Column('type', sa.String(), server_default='Dinosaur', nullable=True),
        sa.Column('happiness', sa.Integer(), server_default='100', nullable=True),
        sa.Column('hunger', sa.Integer(), server_default='50', nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 13. inventory
    op.create_table(
        'inventory',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('child_id', sa.String(), nullable=False),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('item_id', sa.String(), nullable=False),
        sa.Column('quantity', sa.Integer(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['child_id'], ['child.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_child_id'), 'inventory', ['child_id'], unique=False)

    # 14. save_game
    op.create_table(
        'save_game',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('child_id', sa.String(), nullable=False),
        sa.Column('game_state_data', sa.JSON(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['child_id'], ['child.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_save_game_child_id'), 'save_game', ['child_id'], unique=True)

    # 15. shop_item
    op.create_table(
        'shop_item',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('price_coins', sa.Integer(), server_default='0', nullable=True),
        sa.Column('price_diamonds', sa.Integer(), server_default='0', nullable=True),
        sa.Column('icon_asset', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 16. story
    op.create_table(
        'story',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cover_asset', sa.String(), nullable=False),
        sa.Column('audio_asset', sa.String(), nullable=True),
        sa.Column('content_pages', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('story')
    op.drop_table('shop_item')
    op.drop_index(op.f('ix_save_game_child_id'), table_name='save_game')
    op.drop_table('save_game')
    op.drop_index(op.f('ix_inventory_child_id'), table_name='inventory')
    op.drop_table('inventory')
    op.drop_table('pet')
    op.drop_table('avatar_items')
    op.drop_index(op.f('ix_progress_level_id'), table_name='progress')
    op.drop_index(op.f('ix_progress_child_id'), table_name='progress')
    op.drop_table('progress')
    op.drop_index(op.f('ix_question_option_question_id'), table_name='question_option')
    op.drop_table('question_option')
    op.drop_index(op.f('ix_question_category'), table_name='question')
    op.drop_index(op.f('ix_question_level_id'), table_name='question')
    op.drop_table('question')
    op.drop_index(op.f('ix_level_engine_id'), table_name='level')
    op.drop_index(op.f('ix_level_chapter_id'), table_name='level')
    op.drop_table('level')
    op.drop_table('game_engine')
    op.drop_index(op.f('ix_chapter_world_id'), table_name='chapter')
    op.drop_table('chapter')
    op.drop_table('world')
    op.drop_index(op.f('ix_child_parent_id'), table_name='child')
    op.drop_table('child')
    op.drop_index(op.f('ix_parent_user_id'), table_name='parent')
    op.drop_table('parent')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
