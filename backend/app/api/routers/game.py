from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.infrastructure.database import get_db
from app.domain.schemas import (
    WorldSchema, LevelSchema, GameStartRequest, GameStartResponse,
    GameEventRequest, GameFinishRequest, GameFinishResponse, ChildProfile, StoryGenerateRequest
)
from app.repositories.game_repository import GameRepository
from app.repositories.user_repository import UserRepository
from app.domain.game_integrity_service import GameIntegrityService

from app.api.deps import get_current_user, get_current_parent, verify_child_ownership
from app.domain.models import Parent, Child

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

@router.post("/start", response_model=GameStartResponse)
async def start_game_session(
    req: GameStartRequest,
    current_parent: Parent = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db)
):
    from app.domain.game_service import GameService
    service = GameService(db)
    return await service.start_session(req, current_parent)

@router.post("/event")
async def record_game_event(
    req: GameEventRequest,
    current_parent: Parent = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db)
):
    from app.domain.game_service import GameService
    service = GameService(db)
    return await service.record_event(
        session_token=req.session_token,
        event_type=req.event_type,
        event_data=req.event_data,
        current_parent=current_parent
    )

@router.get("/child/{child_id}", response_model=ChildProfile)
async def get_child_profile(
    child: Child = Depends(verify_child_ownership)
):
    return child

@router.post("/finish", response_model=GameFinishResponse)
async def finish_game_session(
    req: GameFinishRequest,
    current_parent: Parent = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db)
):
    from app.domain.game_service import GameService
    service = GameService(db)
    return await service.finish_session(
        session_token=req.session_token,
        category=req.category,
        current_parent=current_parent
    )




@router.post("/story/generate")
async def generate_ai_story(
    req: StoryGenerateRequest,
    current_parent: Parent = Depends(get_current_parent)
):
    from app.domain.story_generator_service import StoryGeneratorService
    story_book = StoryGeneratorService.generate_story(
        topic=req.topic,
        moral_value=req.moral_value,
        category=req.category or "Petualangan 🚩",
        target_age=req.target_age or 4
    )
    return story_book


