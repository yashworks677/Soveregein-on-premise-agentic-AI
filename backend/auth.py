import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.models import User
from backend.audit import log_event

security = HTTPBearer()

# Preset Enterprise Users for on-premise local enclave
USERS_DB = {
    "admin": {
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "user": User(
            username="admin",
            role="ADMIN",
            full_name="Dr. Arvind Sharma",
            department="Plant Safety & Executive Oversight"
        )
    },
    "engineer": {
        "password_hash": hashlib.sha256("eng123".encode()).hexdigest(),
        "user": User(
            username="engineer",
            role="ENGINEER",
            full_name="Rajesh Kumar, Senior Operations Lead",
            department="Pressure Vessels & Distillation Unit 7"
        )
    }
}

def authenticate_user(username: str, password: str) -> Optional[User]:
    user_record = USERS_DB.get(username.strip().lower())
    if not user_record:
        return None
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    if pwd_hash != user_record["password_hash"]:
        return None
    return user_record["user"]

def create_access_token(user: User, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {
        "sub": user.username,
        "role": user.role,
        "full_name": user.full_name,
        "department": user.department
    }
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate sovereign enclave credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        full_name: str = payload.get("full_name")
        department: str = payload.get("department")
        if username is None or role is None:
            raise credentials_exception
        return User(username=username, role=role, full_name=full_name, department=department)
    except Exception:
        raise credentials_exception

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        log_event(
            username=current_user.username,
            role=current_user.role,
            action="ACCESS_DENIED",
            status="BLOCKED",
            details="Attempted unauthorized administrative action on private enclave"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this enclave operation."
        )
    return current_user
