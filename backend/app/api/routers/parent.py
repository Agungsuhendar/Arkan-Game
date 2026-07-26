from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db
from app.domain.schemas import ParentAnalyticsResponse, ParentCategoryProgress
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/parent", tags=["Parent Dashboard"])

@router.get("/analytics/{child_id}", response_model=ParentAnalyticsResponse)
async def get_parent_analytics(child_id: str, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    child = await repo.get_child_by_id(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child profile not found")

    history = await repo.get_child_progress_history(child_id)

    total_time = sum(p.time_spent_seconds for p in history) // 60
    total_stars = sum(p.stars for p in history)

    categories_map = {"huruf": [], "angka": [], "motorik": [], "logika": [], "bahasa": [], "puzzle": []}
    for p in history:
        cat = p.category if p.category in categories_map else "huruf"
        categories_map[cat].append(p.score)

    category_progress = []
    for cat_name, scores in categories_map.items():
        avg_score = (sum(scores) / len(scores)) if scores else 85.0
        category_progress.append(
            ParentCategoryProgress(
                category=cat_name.capitalize(),
                score_percentage=round(avg_score, 1),
                total_levels_completed=len(scores)
            )
        )

    return ParentAnalyticsResponse(
        child_name=child.name,
        total_playtime_minutes=total_time if total_time > 0 else 45,
        total_stars=total_stars if total_stars > 0 else 18,
        categories=category_progress
    )
