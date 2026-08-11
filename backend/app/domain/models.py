import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="parent") # parent, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    parent_profile = relationship("Parent", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Parent(Base):
    __tablename__ = "parent"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    phone = Column(String, nullable=True)
    pin_code = Column(String, default="1234")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="parent_profile")
    children = relationship("Child", back_populates="parent", cascade="all, delete-orphan")

class Child(Base):
    __tablename__ = "child"

    id = Column(String, primary_key=True, default=generate_uuid)
    parent_id = Column(String, ForeignKey("parent.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False, default="Arkan")
    age = Column(Integer, default=5)
    avatar_url = Column(String, nullable=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=100)
    diamonds = Column(Integer, default=10)
    energy = Column(Integer, default=100)
    hearts = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("Parent", back_populates="children")
    progress_records = relationship("Progress", back_populates="child", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="child", cascade="all, delete-orphan")
    save_states = relationship("SaveGame", back_populates="child", cascade="all, delete-orphan")

class World(Base):
    __tablename__ = "world"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False) # e.g. hutan_huruf, kebun_angka
    name = Column(String, nullable=False) # e.g. Hutan Huruf, Kebun Angka
    description = Column(Text, nullable=True)
    boss_name = Column(String, nullable=True)
    npc_name = Column(String, nullable=True)
    icon_asset = Column(String, nullable=False)
    bg_asset = Column(String, nullable=False)
    order_index = Column(Integer, default=1)

    chapters = relationship("Chapter", back_populates="world", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapter"
    __table_args__ = (
        UniqueConstraint("world_id", "order_index", name="uq_chapter_world_order"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    world_id = Column(String, ForeignKey("world.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    order_index = Column(Integer, default=1)

    world = relationship("World", back_populates="chapters")
    levels = relationship("Level", back_populates="chapter", cascade="all, delete-orphan")

class GameEngineConfig(Base):
    __tablename__ = "game_engine"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False) # e.g., balloon_game, memory_game, trace_letter
    name = Column(String, nullable=False)
    engine_type = Column(String, nullable=False) # phaser_3, pixi
    default_config = Column(JSON, default={})

    levels = relationship("Level", back_populates="engine")

class Level(Base):
    __tablename__ = "level"
    __table_args__ = (
        UniqueConstraint("chapter_id", "level_number", name="uq_level_chapter_number"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    chapter_id = Column(String, ForeignKey("chapter.id", ondelete="CASCADE"), nullable=False, index=True)
    engine_id = Column(String, ForeignKey("game_engine.id", ondelete="RESTRICT"), nullable=False, index=True)
    level_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    reward_coins = Column(Integer, default=10)
    reward_xp = Column(Integer, default=25)
    config_override = Column(JSON, default={})

    chapter = relationship("Chapter", back_populates="levels")
    engine = relationship("GameEngineConfig", back_populates="levels")
    questions = relationship("Question", back_populates="level", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "question"

    id = Column(String, primary_key=True, default=generate_uuid)
    level_id = Column(String, ForeignKey("level.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt_text = Column(Text, nullable=False)
    prompt_audio = Column(String, nullable=True)
    category = Column(String, default="huruf", index=True) # huruf, angka, motorik, logika, bahasa, puzzle
    difficulty = Column(Integer, default=1)
    extra_data = Column(JSON, default={})

    level = relationship("Level", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    __tablename__ = "question_option"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("question.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(String, nullable=False)
    option_asset = Column(String, nullable=True)
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="options")

class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (
        UniqueConstraint("child_id", "level_id", name="uq_progress_child_level"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("child.id", ondelete="CASCADE"), nullable=False, index=True)
    level_id = Column(String, ForeignKey("level.id", ondelete="CASCADE"), nullable=False, index=True)
    stars = Column(Integer, default=0) # 1, 2, 3
    score = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, default=0)
    category = Column(String, default="huruf") # huruf, angka, motorik, logika, bahasa
    completed_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("Child", back_populates="progress_records")

class AvatarItem(Base):
    __tablename__ = "avatar_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # hat, glasses, shirt, shoes, accessory
    asset_path = Column(String, nullable=False)
    price_coins = Column(Integer, default=50)

class Pet(Base):
    __tablename__ = "pet"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, default="Dino")
    type = Column(String, default="Dinosaur")
    happiness = Column(Integer, default=100)
    hunger = Column(Integer, default=50)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("child.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String, nullable=False) # avatar_item, pet_food, trophy
    item_id = Column(String, nullable=False)
    quantity = Column(Integer, default=1)

    child = relationship("Child", back_populates="inventory_items")

class SaveGame(Base):
    __tablename__ = "save_game"

    id = Column(String, primary_key=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("child.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    game_state_data = Column(JSON, default={})
    updated_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("Child", back_populates="save_states")

class ShopItem(Base):
    __tablename__ = "shop_item"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    item_type = Column(String, nullable=False) # avatar, pet, energy, heart
    price_coins = Column(Integer, default=0)
    price_diamonds = Column(Integer, default=0)
    icon_asset = Column(String, nullable=False)

class Story(Base):
    __tablename__ = "story"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cover_asset = Column(String, nullable=False)
    audio_asset = Column(String, nullable=True)
    content_pages = Column(JSON, default=[])

class GameSession(Base):
    __tablename__ = "game_session"

    id = Column(String, primary_key=True, default=generate_uuid)
    child_id = Column(String, ForeignKey("child.id", ondelete="CASCADE"), nullable=False, index=True)
    level_id = Column(String, ForeignKey("level.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String, unique=True, nullable=False, index=True, default=generate_uuid)
    status = Column(String, default="active", nullable=False, index=True) # active, completed, invalidated
    start_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_time = Column(DateTime, nullable=True)
    max_score = Column(Integer, default=100)
    attempts_count = Column(Integer, default=1)

    events = relationship("GameEvent", back_populates="session", cascade="all, delete-orphan")

class GameEvent(Base):
    __tablename__ = "game_event"
    __table_args__ = (
        UniqueConstraint("session_id", "question_id", name="uq_game_event_session_question"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("game_session.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True) # question_answered, item_collected, powerup_used, hint_used, cheat_flagged
    question_id = Column(String, nullable=True, index=True)
    event_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("GameSession", back_populates="events")



