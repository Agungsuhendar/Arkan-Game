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
    game_repo = GameRepository(db)
    user_repo = UserRepository(db)

    level = await game_repo.get_level_by_id(req.level_id)
    child = await user_repo.get_child_by_id(req.child_id)
    if not level or not child:
        raise HTTPException(status_code=404, detail="Invalid level or child ID")

    # Ownership check
    if child.parent_id != current_parent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda tidak memiliki hak untuk memulai game untuk anak ini."
        )

    questions_count = len(level.questions) if level.questions else 1
    max_score = GameIntegrityService.calculate_max_score(questions_count)
    min_time = GameIntegrityService.calculate_min_time_seconds(questions_count)

    session = await game_repo.create_game_session(
        child_id=child.id,
        level_id=level.id,
        max_score=max_score
    )

    return GameStartResponse(
        status="started",
        session_token=session.session_token,
        child_id=child.id,
        level_id=level.id,
        max_score=max_score,
        min_time_seconds=min_time,
        level=level
    )

ALLOWED_EVENT_TYPES = {"question_answered", "item_collected", "powerup_used", "hint_used"}

@router.post("/event")
async def record_game_event(
    req: GameEventRequest,
    current_parent: Parent = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db)
):
    if req.event_type not in ALLOWED_EVENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipe event tidak valid: '{req.event_type}'. Tipe yang diperbolehkan: {', '.join(ALLOWED_EVENT_TYPES)}"
        )

    game_repo = GameRepository(db)
    session = await game_repo.get_session_by_token(req.session_token)
    if not session or session.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Sesi game tidak aktif atau token sesi tidak valid."
        )

    # Ownership check on session's child
    user_repo = UserRepository(db)
    child = await user_repo.get_child_by_id(session.child_id)
    if not child or child.parent_id != current_parent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda tidak memiliki hak untuk mencatat event sesi ini."
        )

    # Sanitize event_data (Strip any client-submitted is_correct flags)
    raw_data = req.event_data or {}
    sanitized_data = {k: v for k, v in raw_data.items() if k not in ("is_correct", "correct")}

    if req.event_type == "question_answered":
        question_id = sanitized_data.get("question_id")
        option_id = sanitized_data.get("option_id")
        if not question_id or not option_id:
            raise HTTPException(
                status_code=400,
                detail="Event 'question_answered' wajib menyertakan 'question_id' dan 'option_id'."
            )

        # Enforce 1 session + 1 question = 1 answer
        existing_answers = [
            e for e in (session.events or [])
            if e.event_type == "question_answered"
            and isinstance(e.event_data, dict)
            and e.event_data.get("question_id") == question_id
        ]
        if existing_answers:
            raise HTTPException(
                status_code=400,
                detail=f"Pertanyaan '{question_id}' sudah dijawab dalam sesi ini."
            )

    await game_repo.log_game_event(session.id, req.event_type, sanitized_data)
    return {"status": "recorded", "event_type": req.event_type}



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
    game_repo = GameRepository(db)
    user_repo = UserRepository(db)

    session = await game_repo.get_session_by_token(req.session_token)
    if not session:
        raise HTTPException(status_code=404, detail="Token sesi game tidak ditemukan.")

    # Ownership check on session's child
    child = await user_repo.get_child_by_id(session.child_id)
    if not child or child.parent_id != current_parent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda tidak memiliki hak untuk menyelesaikan sesi anak ini."
        )

    level = await game_repo.get_level_by_id(session.level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level tidak ditemukan.")

    questions_count = len(level.questions) if level.questions else 1

    # Build DB correct_option_ids set for server-side answer validation
    correct_option_ids = set()
    if level.questions:
        for q in level.questions:
            if q.options:
                for opt in q.options:
                    if opt.is_correct:
                        correct_option_ids.add(opt.id)

    # Authoritative Game Integrity & Event-driven Score Validation Pipeline:
    # get_current_parent() -> verify child ownership -> GameSession -> GameEvent / answer validation -> GameIntegrityService -> server calculates score -> server calculates stars -> server calculates reward -> save progress
    val_result = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=session.events or [],
        claimed_score=req.score,
        time_spent_seconds=req.time_spent_seconds,
        questions_count=questions_count,
        correct_option_ids=correct_option_ids
    )


    if not val_result.is_valid:
        await game_repo.invalidate_session(session)
        await game_repo.log_game_event(
            session.id,
            "cheat_flagged",
            {"reason": val_result.rejection_reason, "claimed_score": req.score, "time_spent": req.time_spent_seconds}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=val_result.rejection_reason
        )

    coins_earned = level.reward_coins * val_result.verified_stars
    xp_earned = level.reward_xp * val_result.verified_stars

    # Record progress & reward child
    await game_repo.upsert_progress(
        child_id=session.child_id,
        level_id=session.level_id,
        stars=val_result.verified_stars,
        score=val_result.verified_score,
        time_spent=req.time_spent_seconds,
        category=req.category
    )
    updated_child = await user_repo.update_child_rewards(session.child_id, coins_earned, xp_earned)

    # Mark session as completed
    await game_repo.complete_session(session)

    return GameFinishResponse(
        status="success",
        session_token=session.session_token,
        stars_awarded=val_result.verified_stars,
        score_verified=val_result.verified_score,
        coins_earned=coins_earned,
        xp_earned=xp_earned,
        new_total_coins=updated_child.coins if updated_child else coins_earned,
        new_total_xp=updated_child.xp if updated_child else xp_earned
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


