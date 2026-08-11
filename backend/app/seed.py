import asyncio
import sys
import bcrypt
from sqlalchemy.future import select
from app.infrastructure.database import AsyncSessionLocal
from app.domain.models import User, Parent, Child

async def seed_data():
    print("🌱 Starting manual database seeding...")
    async with AsyncSessionLocal() as session:
        result_user = await session.execute(select(User).where(User.email == "parent@arkan.com"))
        existing_user = result_user.scalars().first()

        if existing_user:
            print("ℹ️ Default user (parent@arkan.com) already exists.")
            return

        print("👤 Creating default test parent user...")
        default_user = User(
            email="parent@arkan.com",
            hashed_password=bcrypt.hashpw("arkan123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
            full_name="Orang Tua Arkan"
        )
        session.add(default_user)
        await session.flush()

        parent_prof = Parent(user_id=default_user.id)
        session.add(parent_prof)
        await session.flush()

        print("🧒 Creating default test child profile...")
        default_child = Child(
            id="arkan_default_child_id",
            parent_id=parent_prof.id,
            name="Arkan",
            age=5,
            level=2,
            xp=150,
            coins=250,
            diamonds=15
        )
        session.add(default_child)
        await session.commit()
        print("✅ Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
