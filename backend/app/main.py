from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, game, parent, ai
from app.infrastructure.database import Base, engine, AsyncSessionLocal
from app.domain.models import World, Chapter, Level, GameEngineConfig, Question, QuestionOption, User, Parent, Child
from app.config import settings

# Control API documentation visibility in production
docs_url = "/docs" if (settings.ENVIRONMENT != "production" or settings.ENABLE_DOCS) else None
redoc_url = "/redoc" if (settings.ENVIRONMENT != "production" or settings.ENABLE_DOCS) else None
openapi_url = "/openapi.json" if (settings.ENVIRONMENT != "production" or settings.ENABLE_DOCS) else None

app = FastAPI(
    title="Petualangan Arkan - Backend API",
    description="Clean Architecture API for Arkan Kids Educational Game Platform",
    version="1.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url
)

# CORS configuration restricted to whitelisted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(game.router, prefix="/api/v1")
app.include_router(parent.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    # Auto-create tables for development/runtime schema setup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial game worlds and engines if empty or missing
    async with AsyncSessionLocal() as session:
        from sqlalchemy.future import select
        result = await session.execute(select(World))
        existing_worlds = result.scalars().all()
        existing_codes = {w.code for w in existing_worlds}

        # Check balloon engine
        result_eng = await session.execute(select(GameEngineConfig))
        engines = result_eng.scalars().all()
        if not engines:
            balloon_engine = GameEngineConfig(
                code="balloon_game",
                name="Balloon Pop Engine",
                engine_type="phaser_3",
                default_config={"speed": 100, "spawn_rate": 1500}
            )
            session.add(balloon_engine)
            await session.flush()

        world_data = [
            ("hutan_huruf", "Hutan Huruf", "Dunia alfabet & fonik bersama Arkan", "Raja Huruf", "Kelinci Pintar", 1),
            ("kebun_angka", "Kebun Angka", "Belajar berhitung di kebun buah", "Monster Hitung", "Tupai Angka", 2),
            ("kota_warna", "Kota Warna", "Mengenal warna & bentuk geometri", "Pelukis Raksasa", "Kucing Warna", 3),
            ("pulau_hewan", "Pulau Hewan", "Belajar suara & habitat satwa", "Naga Hutan", "Lumba-Lumba", 4),
            ("kastil_puzzle", "Kastil Puzzle", "Melatih memori & logika pemecahan masalah", "Ksatria Teka-Teki", "Burung Hantu", 5),
            ("planet_sains", "Planet Sains", "Eksplorasi fenomena alam & sains dasar", "Profesor Alien", "Robot Sains", 6),
            ("gunung_prestasi", "Gunung Prestasi", "Tantangan gabungan & trophy room", "Master Arkan", "Elang Emas", 7),
            ("studio_musik", "Studio Musik", "Bermain piano & irama lagu anak", "Maestro Arkan", "Dino Drummer", 8),
            ("taman_ejaan", "Taman Ejaan Kata", "Belajar mengeja kata & fonik", "Raja Ejaan", "Kelinci Eja", 9),
        ]

        added_any = False
        for code, name, desc, boss, npc, order in world_data:
            if code not in existing_codes:
                w = World(
                    code=code,
                    name=name,
                    description=desc,
                    boss_name=boss,
                    npc_name=npc,
                    icon_asset=f"world_{code}_icon.png",
                    bg_asset=f"world_{code}_bg.jpg",
                    order_index=order
                )
                session.add(w)
                added_any = True

        if added_any or not existing_worlds:
            await session.commit()

        # Seed default test credentials ONLY in development mode when explicitly enabled
        if settings.SEED_DEFAULT_DATA and settings.ENVIRONMENT != "production":
            from app.domain.models import User, Parent, Child
            result_user = await session.execute(select(User))
            users = result_user.scalars().all()
            if not users:
                import bcrypt
                default_user = User(
                    email="parent@arkan.com",
                    hashed_password=bcrypt.hashpw("arkan123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                    full_name="Orang Tua Arkan"
                )
                session.add(default_user)
                await session.flush()

                parent_prof = Parent(user_id=default_user.id)
                session.add(parent_prof)
                await session.flush()

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

@app.get("/")
async def root():
    response = {
        "app": "Petualangan Arkan - Backend API",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }
    if settings.ENVIRONMENT != "production" or settings.ENABLE_DOCS:
        response["docs"] = "/docs"
    return response

