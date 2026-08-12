"""
Security & Anti-Cheat Test Suite

Tests for:
- Cross-parent session access prevention
- Replay attack rejection
- Expired session rejection
- Completed session event rejection
- Foreign question/option rejection
- is_correct field stripping
"""
from datetime import datetime, timedelta
import pytest
from app.domain.models import GameSession, GameEvent
from app.domain.game_integrity_service import GameIntegrityService


class TestReplayProtection:
    """Tests that completed/invalidated sessions cannot be replayed."""

    def test_completed_session_rejected(self):
        session = GameSession(status="completed", start_time=datetime.utcnow() - timedelta(seconds=30))
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=[], questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        assert res.is_valid is False
        assert "tidak aktif" in res.rejection_reason

    def test_invalidated_session_rejected(self):
        session = GameSession(status="invalidated", start_time=datetime.utcnow() - timedelta(seconds=30))
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=[], questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        assert res.is_valid is False

    def test_expired_session_cannot_finish(self):
        """Session older than 60 minutes must be rejected."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(minutes=61))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "opt1"})
        ]
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        assert res.is_valid is False
        assert "kadaluarsa" in res.rejection_reason


class TestAntiCheatValidation:
    """Tests that client-submitted cheats are rejected."""

    def test_fake_score_cannot_bypass(self):
        """Client cannot inflate score — server calculates from events only."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "wrong_opt"})
        ]
        # Service does not accept claimed_score parameter at all
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        assert res.verified_score == 0

    def test_fake_stars_cannot_bypass(self):
        """Client cannot inflate stars — server calculates from verified_score."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "wrong_opt"})
        ]
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        assert res.verified_stars == 0

    def test_fake_is_correct_cannot_bypass(self):
        """Client-submitted is_correct=true in event_data must not count as correct."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "wrong_opt", "is_correct": True})
        ]
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=1,
            correct_options_map={"q1": "opt1"}
        )
        # is_correct field in event_data is completely ignored
        assert res.verified_score == 0
        assert res.verified_stars == 0

    def test_foreign_option_cross_question_rejected(self):
        """Using correct option from question B to answer question A must fail."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "opt_b"}),  # opt_b is correct for q2
            GameEvent(event_type="question_answered", question_id="q2",
                      event_data={"question_id": "q2", "option_id": "opt_a"})   # opt_a is correct for q1
        ]
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=2,
            correct_options_map={"q1": "opt_a", "q2": "opt_b"}
        )
        assert res.verified_score == 0

    def test_missing_answers_rejected(self):
        """Submitting fewer answers than questions must be rejected."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
        events = [
            GameEvent(event_type="question_answered", question_id="q1",
                      event_data={"question_id": "q1", "option_id": "opt1"})
        ]
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=events, questions_count=3,
            correct_options_map={"q1": "opt1", "q2": "opt2", "q3": "opt3"}
        )
        assert res.is_valid is False
        assert "tidak lengkap" in res.rejection_reason

    def test_too_fast_completion_rejected(self):
        """Finishing faster than minimum time must be rejected."""
        session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=1))
        res = GameIntegrityService.validate_session_events_and_score(
            session=session, events=[], questions_count=10,
            correct_options_map={}
        )
        assert res.is_valid is False
        assert "anomali waktu" in res.rejection_reason
