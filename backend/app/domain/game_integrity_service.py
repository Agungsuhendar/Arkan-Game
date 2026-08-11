from dataclasses import dataclass
from typing import Optional, List, Set
from app.domain.models import GameSession, GameEvent

@dataclass
class ValidationResult:
    is_valid: bool
    rejection_reason: Optional[str]
    verified_stars: int
    verified_score: int

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
        claimed_score: int,
        time_spent_seconds: int,
        questions_count: int,
        correct_option_ids: Optional[Set[str]] = None
    ) -> ValidationResult:
        # Step 1: Session Status Check
        if session.status != "active":
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Sesi game tidak aktif (status: {session.status}). Tidak dapat memproses skor.",
                verified_stars=0,
                verified_score=0
            )

        max_score = cls.calculate_max_score(questions_count)
        min_time = cls.calculate_min_time_seconds(questions_count)

        # Step 2: Duration check (Anti-cheat)
        if time_spent_seconds < min_time:
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Deteksi anomali waktu game ({time_spent_seconds} detik < batas minimal {min_time} detik).",
                verified_stars=0,
                verified_score=0
            )

        # Step 3: GameEvent / Strict Server-Side Answer Validation
        question_events = [e for e in events if e.event_type == "question_answered"]
        
        correct_count = 0
        seen_questions = set()

        for e in question_events:
            if isinstance(e.event_data, dict):
                q_id = e.event_data.get("question_id")
                opt_id = e.event_data.get("option_id")

                # Deduplicate multiple submissions for the same question
                if q_id and q_id in seen_questions:
                    continue
                if q_id:
                    seen_questions.add(q_id)

                # STRICT: Only trust database-matched option_id in correct_option_ids (Zero client is_correct fallback)
                if correct_option_ids and opt_id and opt_id in correct_option_ids:
                    correct_count += 1

        # Step 4: Strict Event Completeness Guard (REJECT completion if answer events incomplete)
        if questions_count > 0:
            if len(seen_questions) < questions_count:
                return ValidationResult(
                    is_valid=False,
                    rejection_reason=f"Event jawaban tidak lengkap ({len(seen_questions)} dari {questions_count} soal dijawab).",
                    verified_stars=0,
                    verified_score=0
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
            verified_score=verified_score
        )




