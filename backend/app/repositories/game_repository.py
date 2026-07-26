from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.domain.models import World, Chapter, Level, GameEngineConfig, Question, Progress

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
        level = result.scalars().first()
        if not level:
            # Fallback to first level in database
            fallback_res = await self.db.execute(
                select(Level)
                .options(
                    selectinload(Level.engine),
                    selectinload(Level.questions).selectinload(Question.options)
                )
            )
            level = fallback_res.scalars().first()
        return level

    async def record_progress(
        self, child_id: str, level_id: str, stars: int, score: int, time_spent: int, category: str
    ) -> Progress:
        progress = Progress(
            child_id=child_id,
            level_id=level_id,
            stars=stars,
            score=score,
            time_spent_seconds=time_spent,
            category=category
        )
        self.db.add(progress)
        await self.db.flush()
        return progress
