from typing import List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db
from app.domain.models import User, Parent, Child
from app.repositories.user_repository import UserRepository
from app.core.security import decode_jwt_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_jwt_token(token)
    
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token type tidak valid. Gunakan Access Token."
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kredensial token tidak valid."
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan."
        )

    return user

async def get_current_parent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Parent:
    user_repo = UserRepository(db)
    parent = await user_repo.get_parent_by_user_id(current_user.id)
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil orang tua tidak ditemukan."
        )
    return parent

def require_role(allowed_roles: List[str]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Peran yang dibutuhkan: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

async def verify_child_ownership(
    child_id: str,
    current_parent: Parent = Depends(get_current_parent),
    db: AsyncSession = Depends(get_db)
) -> Child:
    user_repo = UserRepository(db)
    child = await user_repo.get_child_by_id(child_id)
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data anak tidak ditemukan."
        )

    if child.parent_id != current_parent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda tidak memiliki hak untuk mengakses data anak ini."
        )

    return child
