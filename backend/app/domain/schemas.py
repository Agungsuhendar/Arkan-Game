from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict

# User & Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

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

# Game Session & Progress
class GameStartRequest(BaseModel):
    child_id: str
    level_id: str

class GameFinishRequest(BaseModel):
    child_id: str
    level_id: str
    score: int
    stars: int
    time_spent_seconds: int
    category: str

class GameFinishResponse(BaseModel):
    status: str
    stars_awarded: int
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
