from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List, Dict, Set
from app.domain.models import GameSession, GameEvent

@dataclass
class ValidationResult:
    is_valid: bool
    rejection_reason: Optional[str]
    verified_stars: int
    verified_score: int
    server_duration_seconds: int = 0

class GameIntegrityService:
    @staticmethod
    def calculate_max_score(questions_count: int) -> int:
        count = max(questions_count, 1)
        return count * 100

    @staticmethod
    def calculate_min_time_seconds(questions_count: int) -> int:
        count = max(questions_count, 1)
        return max(3, count * 1)

    @staticmethod
    def calculate_star_rating(score: int, max_score: int) -> int:
        if max_score <= 0 or score <= 0:
            return 0
        pct = (score / max_score) * 100.0
        if pct >= 90.0:
            return 3
        elif pct >= 70.0:
            return 2
        elif pct >= 50.0:
            return 1
        else:
            return 0

    @classmethod
    def validate_session_events_and_score(
        cls,
        session: GameSession,
        events: List[GameEvent],
        questions_count: int,
        correct_options_map: Optional[Dict[str, str]] = None
    ) -> ValidationResult:
        # Step 1: Session Status & Expiration Check (Strict Lifecycle & Replay Protection)
        if session.status != "active":
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Sesi game tidak aktif (status: '{session.status}'). Tidak dapat memproses ulang.",
                verified_stars=0,
                verified_score=0
            )

        now = datetime.utcnow()
        server_duration = int((now - session.start_time).total_seconds())

        # Expiration Check: Max 60 minutes
        if server_duration > 3600:
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Sesi game telah kadaluarsa ({server_duration} detik > batas 3600 detik).",
                verified_stars=0,
                verified_score=0,
                server_duration_seconds=server_duration
            )

        max_score = cls.calculate_max_score(questions_count)
        min_time = cls.calculate_min_time_seconds(questions_count)

        # Step 2: Authoritative Server Duration Check (Zero client timing trust)
        if server_duration < min_time:
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Deteksi anomali waktu game (durasi server {server_duration}s < minimal {min_time}s).",
                verified_stars=0,
                verified_score=0,
                server_duration_seconds=server_duration
            )

        # Step 3: Per-Question Server Answer Validation
        question_events = [e for e in events if e.event_type == "question_answered"]
        
        correct_count = 0
        seen_questions = set()

        for e in question_events:
            event_dict = e.event_data if isinstance(e.event_data, dict) else {}
            q_id = e.question_id or event_dict.get("question_id")
            opt_id = event_dict.get("option_id")

            # Deduplicate multiple submissions for the same question
            if q_id and q_id in seen_questions:
                continue
            if q_id:
                seen_questions.add(q_id)

            # STRICT Per-Question Validation: Check if opt_id matches correct_option_id for this SPECIFIC question_id
            if correct_options_map and q_id in correct_options_map:
                if correct_options_map[q_id] == opt_id:
                    correct_count += 1

        # Step 4: Strict Event Completeness Guard (REJECT completion if answer events incomplete)
        if questions_count > 0:
            if len(seen_questions) < questions_count:
                return ValidationResult(
                    is_valid=False,
                    rejection_reason=f"Event jawaban tidak lengkap ({len(seen_questions)} dari {questions_count} soal dijawab).",
                    verified_stars=0,
                    verified_score=0,
                    server_duration_seconds=server_duration
                )
            verified_score = min(correct_count * 100, max_score)
        else:
            verified_score = 0

        # Step 5: Server calculates verified stars
        verified_stars = cls.calculate_star_rating(verified_score, max_score)

        return ValidationResult(
            is_valid=True,
            rejection_reason=None,
            verified_stars=verified_stars,
            verified_score=verified_score,
            server_duration_seconds=server_duration
        )





