"""
Microsoft SIEM & XDR Simulator — Backend API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.sentinel import router as sentinel_router
from app.api.defender import router as defender_router
from app.api.labs import router as labs_router
from app.api.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await init_db()
    yield


app = FastAPI(
    title="Microsoft SIEM & XDR Simulator API",
    description="Backend API for the open-source Microsoft Sentinel and Defender XDR training simulator.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(sentinel_router, prefix="/api/v1/sentinel", tags=["Microsoft Sentinel"])
app.include_router(defender_router, prefix="/api/v1/defender", tags=["Microsoft Defender XDR"])
app.include_router(labs_router, prefix="/api/v1/labs", tags=["Labs & Scenarios"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "msiem-xdr-simulator"}