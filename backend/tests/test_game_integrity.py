from datetime import datetime, timedelta
import pytest
from app.domain.models import GameSession, GameEvent
from app.domain.game_integrity_service import GameIntegrityService, ValidationResult

def test_calculate_max_score():
    assert GameIntegrityService.calculate_max_score(5) == 500
    assert GameIntegrityService.calculate_max_score(0) == 100

def test_calculate_star_rating():
    assert GameIntegrityService.calculate_star_rating(95, 100) == 3
    assert GameIntegrityService.calculate_star_rating(75, 100) == 2
    assert GameIntegrityService.calculate_star_rating(50, 100) == 1
    assert GameIntegrityService.calculate_star_rating(30, 100) == 0

def test_validate_inactive_session_rejected():
    session = GameSession(status="completed", start_time=datetime.utcnow())
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=[],
        questions_count=5,
        correct_options_map={"q1": "opt1"}
    )
    assert res.is_valid is False
    assert "tidak aktif" in res.rejection_reason

def test_validate_expired_session_rejected():
    session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(hours=2))
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=[],
        questions_count=5,
        correct_options_map={"q1": "opt1"}
    )
    assert res.is_valid is False
    assert "kadaluarsa" in res.rejection_reason

def test_validate_too_fast_duration_rejected():
    session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=1))
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=[],
        questions_count=5,
        correct_options_map={"q1": "opt1"}
    )
    assert res.is_valid is False
    assert "anomali waktu" in res.rejection_reason

def test_validate_incomplete_events_rejected():
    session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=15))
    events = [
        GameEvent(event_type="question_answered", question_id="q1", event_data={"question_id": "q1", "option_id": "opt1"})
    ]
    correct_map = {"q1": "opt1", "q2": "opt2", "q3": "opt3"}
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=events,
        questions_count=3,
        correct_options_map=correct_map
    )
    assert res.is_valid is False
    assert "Event jawaban tidak lengkap" in res.rejection_reason

def test_validate_wrong_option_per_question_rejected_score():
    session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=15))
    events = [
        GameEvent(event_type="question_answered", question_id="q1", event_data={"question_id": "q1", "option_id": "opt1"}), # Correct
        GameEvent(event_type="question_answered", question_id="q2", event_data={"question_id": "q2", "option_id": "wrong_opt"}) # Wrong
    ]
    correct_map = {"q1": "opt1", "q2": "opt2"}
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=events,
        questions_count=2,
        correct_options_map=correct_map
    )
    assert res.is_valid is True
    assert res.verified_score == 100 # Only 1 question correct out of 2
    assert res.verified_stars == 1

def test_validate_perfect_completion_success():
    session = GameSession(status="active", start_time=datetime.utcnow() - timedelta(seconds=20))
    events = [
        GameEvent(event_type="question_answered", question_id="q1", event_data={"question_id": "q1", "option_id": "opt1"}),
        GameEvent(event_type="question_answered", question_id="q2", event_data={"question_id": "q2", "option_id": "opt2"})
    ]
    correct_map = {"q1": "opt1", "q2": "opt2"}
    res = GameIntegrityService.validate_session_events_and_score(
        session=session,
        events=events,
        questions_count=2,
        correct_options_map=correct_map
    )
    assert res.is_valid is True
    assert res.verified_score == 200
    assert res.verified_stars == 3
