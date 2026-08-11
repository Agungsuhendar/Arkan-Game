from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    user_id: str
    email: str
    role: str = "parent"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: Any

    class Config:
        from_attributes = True

class ParentResponse(BaseModel):
    id: str
    user_id: str
    phone: Optional[str] = None
    children: List["ChildProfile"] = []

    class Config:
        from_attributes = True


# Child Profile
class ChildProfile(BaseModel):
    id: str
    name: str
    age: int
    level: int
    xp: int
    coins: int
    diamonds: int
    energy: int
    hearts: int
    avatar_url: Optional[str]

    class Config:
        from_attributes = True

# World & Level
class QuestionOptionSchema(BaseModel):
    id: str
    option_text: str
    option_asset: Optional[str]
    is_correct: bool

    class Config:
        from_attributes = True

class QuestionSchema(BaseModel):
    id: str
    prompt_text: str
    prompt_audio: Optional[str]
    category: str
    options: List[QuestionOptionSchema]

    class Config:
        from_attributes = True

class GameEngineSchema(BaseModel):
    id: str
    code: str
    name: str
    engine_type: str
    default_config: Dict[str, Any]

    class Config:
        from_attributes = True

class LevelSchema(BaseModel):
    id: str
    level_number: int
    title: str
    reward_coins: int
    reward_xp: int
    engine: GameEngineSchema
    questions: List[QuestionSchema]

    class Config:
        from_attributes = True

class WorldSchema(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str]
    boss_name: Optional[str]
    npc_name: Optional[str]
    icon_asset: str
    bg_asset: str
    order_index: int

    class Config:
        from_attributes = True

# Game Session & Integrity
class GameStartRequest(BaseModel):
    child_id: str
    level_id: str

class GameStartResponse(BaseModel):
    status: str = "started"
    session_token: str
    child_id: str
    level_id: str
    max_score: int
    min_time_seconds: int
    level: LevelSchema

class GameEventRequest(BaseModel):
    session_token: str
    event_type: str  # question_answered, item_collected, powerup_used, hint_used, cheat_flagged
    event_data: Dict[str, Any] = {}

class GameFinishRequest(BaseModel):
    session_token: str
    child_id: Optional[str] = None
    level_id: Optional[str] = None
    score: int
    questions_correct: Optional[int] = None
    total_questions: Optional[int] = None
    time_spent_seconds: int
    category: str = "huruf"

class GameFinishResponse(BaseModel):
    status: str
    session_token: str
    stars_awarded: int
    score_verified: int
    coins_earned: int
    xp_earned: int
    new_total_coins: int
    new_total_xp: int


# Parent Dashboard Analytics
class ParentCategoryProgress(BaseModel):
    category: str
    score_percentage: float
    total_levels_completed: int

class ParentAnalyticsResponse(BaseModel):
    child_name: str
    total_playtime_minutes: int
    total_stars: int
    categories: List[ParentCategoryProgress]

# AI Story Generator Schema
class StoryGenerateRequest(BaseModel):
    topic: str
    moral_value: str
    category: Optional[str] = "Petualangan 🚩"
    target_age: Optional[int] = 4

