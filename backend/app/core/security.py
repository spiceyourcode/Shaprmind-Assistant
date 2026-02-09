from datetime import datetime, timedelta, timezone
from typing import Any
import hashlib

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _normalize_password(password: str) -> str:
    # bcrypt only uses the first 72 bytes; pre-hash long passwords.
    if len(password.encode("utf-8")) > 72:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()
    return password


def hash_password(password: str) -> str:
    return pwd_context.hash(_normalize_password(password))


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(_normalize_password(password), password_hash)


def create_access_token(subject: str, expires_minutes: int = 60 * 24) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
