from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.domain.models import Parent, GameSession, Question
from app.domain.schemas import GameStartRequest, GameStartResponse, GameFinishRequest, GameFinishResponse
from app.repositories.game_repository import GameRepository
from app.repositories.user_repository import UserRepository
from app.domain.game_integrity_service import GameIntegrityService
from app.infrastructure.logging_config import get_logger

logger = get_logger("game.service")

class GameService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.game_repo = GameRepository(db)
        self.user_repo = UserRepository(db)

    async def start_session(self, req: GameStartRequest, current_parent: Parent) -> GameStartResponse:
        level = await self.game_repo.get_level_by_id(req.level_id)
        if not level:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level tidak ditemukan.")

        child = await self.user_repo.get_child_by_id(req.child_id)
        if not child:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data anak tidak ditemukan.")

        # Authorization Ownership Guard
        if child.parent_id != current_parent.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak. Anda tidak memiliki hak untuk memulai game untuk anak ini."
            )

        questions_count = len(level.questions) if level.questions else 0
        max_score = GameIntegrityService.calculate_max_score(questions_count)
        min_time = GameIntegrityService.calculate_min_time_seconds(questions_count)

        session = await self.game_repo.create_game_session(
            child_id=child.id,
            level_id=level.id,
            max_score=max_score
        )

        logger.info("game.session.started", extra={
            "event": "game.session.started",
            "session_id": session.id,
            "child_id": child.id,
            "level_id": level.id
        })

        return GameStartResponse(
            status="started",
            session_token=session.session_token,
            child_id=child.id,
            level_id=level.id,
            max_score=max_score,
            min_time_seconds=min_time,
            level=level
        )

    async def record_event(
        self,
        session_token: str,
        event_type: str,
        event_data: Dict[str, Any],
        current_parent: Parent
    ) -> Dict[str, str]:
        ALLOWED_EVENT_TYPES = {"question_answered", "item_collected", "powerup_used", "hint_used"}
        if event_type not in ALLOWED_EVENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipe event '{event_type}' tidak diperbolehkan."
            )

        session = await self.game_repo.get_session_by_token(session_token)
        if not session or session.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sesi game tidak aktif atau token sesi tidak valid."
            )

        # Authorization Ownership Guard
        child = await self.user_repo.get_child_by_id(session.child_id)
        if not child or child.parent_id != current_parent.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak. Anda tidak memiliki hak untuk mencatat event sesi ini."
            )

        # Sanitize data
        sanitized_data = {k: v for k, v in event_data.items() if k not in ("is_correct", "correct")}
        question_id = None

        if event_type == "question_answered":
            question_id = sanitized_data.get("question_id")
            option_id = sanitized_data.get("option_id")
            if not question_id or not option_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Event 'question_answered' wajib menyertakan 'question_id' dan 'option_id'."
                )

            # Strict Question-Level Validation (Verify question belongs to session's level)
            level = await self.game_repo.get_level_by_id(session.level_id)
            if not level or not any(q.id == question_id for q in (level.questions or [])):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Soal '{question_id}' tidak termasuk dalam level ini."
                )

            # Strict Option-Question Binding (Verify option_id belongs to question_id)
            target_question = next((q for q in level.questions if q.id == question_id), None)
            if not target_question or not any(opt.id == option_id for opt in (target_question.options or [])):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pilihan '{option_id}' tidak valid untuk soal '{question_id}'."
                )

            # Enforce 1 Session + 1 Question = 1 Answer deduplication constraint
            existing_answers = [
                e for e in (session.events or [])
                if e.event_type == "question_answered"
                and (e.question_id == question_id or (isinstance(e.event_data, dict) and e.event_data.get("question_id") == question_id))
            ]
            if existing_answers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Pertanyaan '{question_id}' sudah dijawab dalam sesi ini."
                )

        await self.game_repo.log_game_event(
            session_id=session.id,
            event_type=event_type,
            event_data=sanitized_data,
            question_id=question_id
        )
        logger.info("game.event.recorded", extra={
            "event": "game.event.recorded",
            "session_id": session.id,
            "child_id": session.child_id,
            "event_type": event_type
        })

        return {"status": "recorded", "event_type": event_type}

    async def finish_session(
        self,
        session_token: str,
        category: str,
        current_parent: Parent
    ) -> GameFinishResponse:
        # SELECT FOR UPDATE — row-level lock prevents concurrent finish race condition
        session = await self.game_repo.get_session_by_token_for_update(session_token)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token sesi game tidak ditemukan.")

        # Idempotency & Replay Protection (under row lock, only 1 request can pass)
        if session.status != "active":
            child = await self.user_repo.get_child_by_id(session.child_id)
            return GameFinishResponse(
                status="already_completed",
                session_token=session.session_token,
                stars_awarded=0,
                score_verified=0,
                coins_earned=0,
                xp_earned=0,
                new_total_coins=child.coins if child else 0,
                new_total_xp=child.xp if child else 0
            )

        # Authorization Ownership Guard
        child = await self.user_repo.get_child_by_id(session.child_id)
        if not child or child.parent_id != current_parent.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak. Anda tidak memiliki hak untuk menyelesaikan sesi anak ini."
            )

        level = await self.game_repo.get_level_by_id(session.level_id)
        if not level:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level tidak ditemukan.")

        questions_count = len(level.questions) if level.questions else 0

        # Build Per-Question Correct Option Map {question_id: correct_option_id}
        correct_options_map = {}
        if level.questions:
            for q in level.questions:
                if q.options:
                    for opt in q.options:
                        if opt.is_correct:
                            correct_options_map[q.id] = opt.id

        # Execute Authoritative Server Game Integrity Pipeline
        val_result = GameIntegrityService.validate_session_events_and_score(
            session=session,
            events=session.events or [],
            questions_count=questions_count,
            correct_options_map=correct_options_map
        )

        if not val_result.is_valid:
            await self.game_repo.invalidate_session(session)
            await self.game_repo.log_game_event(
                session.id,
                "cheat_flagged",
                {"reason": val_result.rejection_reason, "server_duration": val_result.server_duration_seconds}
            )
            logger.warning("game.integrity.failed", extra={
                "event": "game.integrity.failed",
                "session_id": session.id,
                "child_id": session.child_id,
                "reason": val_result.rejection_reason
            })
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=val_result.rejection_reason
            )

        # Atomic state transition: active → completed (returns False if already transitioned)
        was_completed = await self.game_repo.atomic_complete_session(session.id)
        if not was_completed:
            # Another concurrent request already completed this session
            child = await self.user_repo.get_child_by_id(session.child_id)
            return GameFinishResponse(
                status="already_completed",
                session_token=session.session_token,
                stars_awarded=0,
                score_verified=0,
                coins_earned=0,
                xp_earned=0,
                new_total_coins=child.coins if child else 0,
                new_total_xp=child.xp if child else 0
            )

        # Log session_finished event (event sourcing completeness)
        await self.game_repo.log_game_event(
            session.id,
            "session_finished",
            {
                "verified_score": val_result.verified_score,
                "verified_stars": val_result.verified_stars,
                "server_duration": val_result.server_duration_seconds,
                "questions_count": questions_count,
                "correct_count": val_result.verified_score // 100 if val_result.verified_score > 0 else 0
            }
        )

        # Atomic reward calculation & distribution (no read-modify-write race)
        coins_earned = level.reward_coins * val_result.verified_stars
        xp_earned = level.reward_xp * val_result.verified_stars

        await self.game_repo.upsert_progress(
            child_id=session.child_id,
            level_id=session.level_id,
            stars=val_result.verified_stars,
            score=val_result.verified_score,
            time_spent=val_result.server_duration_seconds,
            category=category
        )
        updated_child = await self.game_repo.atomic_update_child_rewards(
            session.child_id, coins_earned, xp_earned
        )

        logger.info("game.session.completed", extra={
            "event": "game.session.completed",
            "session_id": session.id,
            "child_id": session.child_id,
            "score": val_result.verified_score,
            "stars": val_result.verified_stars,
            "coins": coins_earned,
            "xp": xp_earned
        })

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

