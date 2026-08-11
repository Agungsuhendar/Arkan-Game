from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.domain.models import User, Parent, Child, Progress

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_parent_by_user_id(self, user_id: str) -> Optional[Parent]:
        result = await self.db.execute(
            select(Parent).options(selectinload(Parent.children)).filter(Parent.user_id == user_id)
        )
        return result.scalars().first()

    async def create_user(self, email: str, hashed_password: str, full_name: str) -> User:
        user = User(email=email, hashed_password=hashed_password, full_name=full_name)
        self.db.add(user)
        await self.db.flush()

        parent = Parent(user_id=user.id)
        self.db.add(parent)
        await self.db.flush()

        child = Child(parent_id=parent.id, name="Arkan", age=5)
        self.db.add(child)
        await self.db.flush()

        return user

    async def get_child_by_id(self, child_id: str) -> Optional[Child]:
        result = await self.db.execute(select(Child).filter(Child.id == child_id))
        return result.scalars().first()


    async def update_child_rewards(self, child_id: str, coins_delta: int, xp_delta: int) -> Child:
        child = await self.get_child_by_id(child_id)
        if child:
            child.coins += coins_delta
            child.xp += xp_delta
            # Level up check (every 100 XP)
            child.level = 1 + (child.xp // 100)
            await self.db.flush()
        return child

    async def get_child_progress_history(self, child_id: str) -> List[Progress]:
        result = await self.db.execute(
            select(Progress).filter(Progress.child_id == child_id)
        )
        return result.scalars().all()
