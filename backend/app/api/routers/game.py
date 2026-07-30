from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.infrastructure.database import get_db
from app.domain.schemas import (
    WorldSchema, LevelSchema, GameStartRequest, GameFinishRequest, GameFinishResponse, ChildProfile, StoryGenerateRequest
)
from app.repositories.game_repository import GameRepository
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/game", tags=["Game"])

@router.get("/worlds", response_model=List[WorldSchema])
async def get_worlds(db: AsyncSession = Depends(get_db)):
    repo = GameRepository(db)
    worlds = await repo.get_all_worlds()
    return worlds

@router.get("/world/{code}", response_model=WorldSchema)
async def get_world_detail(code: str, db: AsyncSession = Depends(get_db)):
    repo = GameRepository(db)
    world = await repo.get_world_by_code(code)
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    return world

@router.get("/level/{level_id}", response_model=LevelSchema)
async def get_level_config(level_id: str, db: AsyncSession = Depends(get_db)):
    repo = GameRepository(db)
    level = await repo.get_level_by_id(level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    return level

@router.post("/start")
async def start_game_session(req: GameStartRequest, db: AsyncSession = Depends(get_db)):
    game_repo = GameRepository(db)
    user_repo = UserRepository(db)

    level = await game_repo.get_level_by_id(req.level_id)
    child = await user_repo.get_child_by_id(req.child_id)
    if not level or not child:
        raise HTTPException(status_code=404, detail="Invalid level or child ID")

    return {"status": "started", "level_id": req.level_id, "child_id": req.child_id}

@router.get("/child/{child_id}", response_model=ChildProfile)
async def get_child_profile(child_id: str, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    child = await user_repo.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")
    return child

@router.post("/finish", response_model=GameFinishResponse)
async def finish_game_session(req: GameFinishRequest, db: AsyncSession = Depends(get_db)):
    game_repo = GameRepository(db)
    user_repo = UserRepository(db)

    level = await game_repo.get_level_by_id(req.level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")

    coins_earned = level.reward_coins * req.stars
    xp_earned = level.reward_xp * req.stars

    # Record progress & reward child
    await game_repo.record_progress(
        child_id=req.child_id,
        level_id=req.level_id,
        stars=req.stars,
        score=req.score,
        time_spent=req.time_spent_seconds,
        category=req.category
    )
    updated_child = await user_repo.update_child_rewards(req.child_id, coins_earned, xp_earned)

    return GameFinishResponse(
        status="success",
        stars_awarded=req.stars,
        coins_earned=coins_earned,
        xp_earned=xp_earned,
        new_total_coins=updated_child.coins if updated_child else coins_earned,
        new_total_xp=updated_child.xp if updated_child else xp_earned
    )

@router.post("/story/generate")
async def generate_ai_story(req: StoryGenerateRequest):
    from app.domain.story_generator_service import StoryGeneratorService
    story_book = StoryGeneratorService.generate_story(
        topic=req.topic,
        moral_value=req.moral_value,
        category=req.category or "Petualangan 🚩",
        target_age=req.target_age or 4
    )
    return story_book
