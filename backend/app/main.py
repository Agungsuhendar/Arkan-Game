from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, game, parent
from app.infrastructure.database import Base, engine, AsyncSessionLocal
from app.domain.models import World, Chapter, Level, GameEngineConfig, Question, QuestionOption, User, Parent, Child

app = FastAPI(
    title="Petualangan Arkan - Backend API",
    description="Clean Architecture API for Arkan Kids Educational Game Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(game.router, prefix="/api/v1")
app.include_router(parent.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    # Auto-create tables for local development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial game worlds and engines if empty
    async with AsyncSessionLocal() as session:
        from sqlalchemy.future import select
        result = await session.execute(select(World))
        worlds = result.scalars().all()
        if not worlds:
            # Create default mini-game engine
            balloon_engine = GameEngineConfig(
                code="balloon_game",
                name="Balloon Pop Engine",
                engine_type="phaser_3",
                default_config={"speed": 100, "spawn_rate": 1500}
            )
            session.add(balloon_engine)
            await session.flush()

            # Create 7 Worlds from Game Story
            world_data = [
                ("hutan_huruf", "Hutan Huruf", "Dunia alfabet & fonik bersama Arkan", "Raja Huruf", "Kelinci Pintar", 1),
                ("kebun_angka", "Kebun Angka", "Belajar berhitung di kebun buah", "Monster Hitung", "Tupai Angka", 2),
                ("kota_warna", "Kota Warna", "Mengenal warna & bentuk geometri", "Pelukis Raksasa", "Kucing Warna", 3),
                ("pulau_hewan", "Pulau Hewan", "Belajar suara & habitat satwa", "Naga Hutan", "Lumba-Lumba", 4),
                ("kastil_puzzle", "Kastil Puzzle", "Melatih memori & logika pemecahan masalah", "Ksatria Teka-Teki", "Burung Hantu", 5),
                ("planet_sains", "Planet Sains", "Eksplorasi fenomena alam & sains dasar", "Profesor Alien", "Robot Sains", 6),
                ("gunung_prestasi", "Gunung Prestasi", "Tantangan gabungan & trophy room", "Master Arkan", "Elang Emas", 7),
            ]

            for code, name, desc, boss, npc, order in world_data:
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
                await session.flush()

                # Add sample chapter & level for Hutan Huruf
                if code == "hutan_huruf":
                    ch = Chapter(world_id=w.id, name="Bab 1: Huruf Vokal", order_index=1)
                    session.add(ch)
                    await session.flush()

                    lvl = Level(
                        chapter_id=ch.id,
                        engine_id=balloon_engine.id,
                        level_number=1,
                        title="Letuskan Balon Huruf A",
                        reward_coins=20,
                        reward_xp=50
                    )
                    session.add(lvl)
                    await session.flush()

                    q = Question(
                        level_id=lvl.id,
                        prompt_text="Letuskan balon yang memiliki huruf A!",
                        prompt_audio="voice_prompt_letter_a.mp3",
                        category="huruf",
                        difficulty=1
                    )
                    session.add(q)
                    await session.flush()

                    session.add_all([
                        QuestionOption(question_id=q.id, option_text="A", is_correct=True),
                        QuestionOption(question_id=q.id, option_text="B", is_correct=False),
                        QuestionOption(question_id=q.id, option_text="C", is_correct=False)
                    ])

            # Create default test user & child
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
    return {
        "app": "Petualangan Arkan - Backend API",
        "version": "1.0.0",
        "docs": "/docs"
    }
