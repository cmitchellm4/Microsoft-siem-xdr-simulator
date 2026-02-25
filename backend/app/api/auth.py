from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@router.post("/login")
async def login(body: LoginRequest):
    """Authenticate a user and return a token."""
    # Hardcoded for now — real auth comes in a later phase
    if body.username == "admin" and body.password == "simulator123":
        return {
            "access_token": "dev-token-replace-later",
            "token_type": "bearer",
            "username": body.username
        }
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.post("/register")
async def register(body: RegisterRequest):
    """Register a new user account."""
    return {
        "message": "Registration not yet implemented",
        "username": body.username
    }

@router.get("/me")
async def get_current_user():
    """Return the currently authenticated user."""
    return {
        "username": "admin",
        "email": "admin@simulator.local",
        "role": "admin"
    }