from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db
from app.domain.schemas import UserRegister, UserLogin, Token, RefreshTokenRequest, UserResponse, ParentResponse, ChildProfile
from app.repositories.user_repository import UserRepository
from app.core.security import (
    validate_password_policy, hash_password, verify_password,
    create_access_token, create_refresh_token, decode_jwt_token
)
from app.middleware.rate_limiter import auth_rate_limiter
from app.api.deps import get_current_user, get_current_parent

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=Token, dependencies=[Depends(auth_rate_limiter)])
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # 1. Enforce password policy
    validate_password_policy(user_in.password)

    # 2. Check existing user
    repo = UserRepository(db)
    existing = await repo.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar."
        )

    # 3. Create User & linked Parent profile
    hashed_pw = hash_password(user_in.password)
    user = await repo.create_user(user_in.email, hashed_pw, user_in.full_name)

    # 4. Issue access & refresh tokens
    access_token, expires_in = create_access_token(user.id, user.email, user.role or "parent")
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user_id=user.id,
        email=user.email,
        role=user.role or "parent"
    )

@router.post("/login", response_model=Token, dependencies=[Depends(auth_rate_limiter)])
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak valid."
        )

    access_token, expires_in = create_access_token(user.id, user.email, user.role or "parent")
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user_id=user.id,
        email=user.email,
        role=user.role or "parent"
    )

@router.post("/refresh", response_model=Token, dependencies=[Depends(auth_rate_limiter)])
async def refresh_access_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_jwt_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tipe token tidak valid. Harus berupa refresh token."
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak valid."
        )

    repo = UserRepository(db)
    user = await repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan."
        )

    new_access_token, expires_in = create_access_token(user.id, user.email, user.role or "parent")
    new_refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user_id=user.id,
        email=user.email,
        role=user.role or "parent"
    )

@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
    current_parent=Depends(get_current_parent)
):
    children_data = [ChildProfile.model_validate(c) for c in current_parent.children]
    return {
        "user": UserResponse.model_validate(current_user),
        "parent": ParentResponse(
            id=current_parent.id,
            user_id=current_parent.user_id,
            phone=current_parent.phone,
            children=children_data
        )
    }

