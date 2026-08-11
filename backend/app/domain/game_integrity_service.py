from dataclasses import dataclass
from typing import Optional
from app.domain.models import GameSession

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
    def validate_session_completion(
        cls,
        session: GameSession,
        claimed_score: int,
        time_spent_seconds: int,
        questions_count: int
    ) -> ValidationResult:
        # Check 1: Session Status
        if session.status != "active":
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Sesi game tidak aktif (status: {session.status}). Tidak dapat memproses skor.",
                verified_stars=0,
                verified_score=0
            )

        max_score = cls.calculate_max_score(questions_count)
        min_time = cls.calculate_min_time_seconds(questions_count)

        # Check 2: Anti-cheat duration check
        if time_spent_seconds < min_time:
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Deteksi anomali waktu game ({time_spent_seconds} detik < batas minimal {min_time} detik).",
                verified_stars=0,
                verified_score=0
            )

        # Check 3: Score upper bound check
        if claimed_score > max_score or claimed_score < 0:
            return ValidationResult(
                is_valid=False,
                rejection_reason=f"Deteksi anomali skor ({claimed_score} melebihi batas maksimal {max_score}).",
                verified_stars=0,
                verified_score=0
            )

        # Calculate verified stars and score
        verified_score = claimed_score
        stars = cls.calculate_star_rating(verified_score, max_score)

        return ValidationResult(
            is_valid=True,
            rejection_reason=None,
            verified_stars=stars,
            verified_score=verified_score
        )
