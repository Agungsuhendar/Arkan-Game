from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from app.domain.models import (
    World, Chapter, Level, GameEngineConfig, Question, Progress, GameSession, GameEvent
)

class GameRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_worlds(self) -> List[World]:
        result = await self.db.execute(select(World).order_by(World.order_index))
        return result.scalars().all()

    async def get_world_by_code(self, code: str) -> Optional[World]:
        result = await self.db.execute(
            select(World)
            .options(selectinload(World.chapters).selectinload(Chapter.levels))
            .filter(World.code == code)
        )
        return result.scalars().first()

    async def get_level_by_id(self, level_id: str) -> Optional[Level]:
        result = await self.db.execute(
            select(Level)
            .options(
                selectinload(Level.engine),
                selectinload(Level.questions).selectinload(Question.options)
            )
            .filter(Level.id == level_id)
        )
        return result.scalars().first()

    async def create_game_session(self, child_id: str, level_id: str, max_score: int = 100) -> GameSession:
        # Check attempts count for this level by child
        existing_res = await self.db.execute(
            select(GameSession)
            .filter(GameSession.child_id == child_id, GameSession.level_id == level_id)
        )
        existing_sessions = existing_res.scalars().all()
        attempt_number = len(existing_sessions) + 1

        token = str(uuid.uuid4())
        session = GameSession(
            child_id=child_id,
            level_id=level_id,
            session_token=token,
            status="active",
            start_time=datetime.utcnow(),
            max_score=max_score,
            attempts_count=attempt_number
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_session_by_token(self, session_token: str) -> Optional[GameSession]:
        result = await self.db.execute(
            select(GameSession)
            .options(selectinload(GameSession.events))
            .filter(GameSession.session_token == session_token)
        )
        return result.scalars().first()

    async def log_game_event(
        self,
        session_id: str,
        event_type: str,
        event_data: dict,
        question_id: Optional[str] = None
    ) -> GameEvent:
        event = GameEvent(
            session_id=session_id,
            event_type=event_type,
            question_id=question_id,
            event_data=event_data,
            created_at=datetime.utcnow()
        )
        self.db.add(event)
        await self.db.flush()
        return event


    async def invalidate_session(self, session: GameSession) -> None:
        session.status = "invalidated"
        session.end_time = datetime.utcnow()
        await self.db.flush()

    async def complete_session(self, session: GameSession) -> None:
        session.status = "completed"
        session.end_time = datetime.utcnow()
        await self.db.flush()

    async def upsert_progress(
        self, child_id: str, level_id: str, stars: int, score: int, time_spent: int, category: str
    ) -> Progress:
        res = await self.db.execute(
            select(Progress).filter(Progress.child_id == child_id, Progress.level_id == level_id)
        )
        existing = res.scalars().first()

        if existing:
            existing.stars = max(existing.stars, stars)
            existing.score = max(existing.score, score)
            existing.time_spent_seconds += time_spent
            existing.completed_at = datetime.utcnow()
            await self.db.flush()
            return existing
        else:
            progress = Progress(
                child_id=child_id,
                level_id=level_id,
                stars=stars,
                score=score,
                time_spent_seconds=time_spent,
                category=category,
                completed_at=datetime.utcnow()
            )
            self.db.add(progress)
            await self.db.flush()
            return progress

