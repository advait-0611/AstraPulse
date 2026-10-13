
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.workers import router as workers_router
from app.api.scheduling import router as scheduling_router
from app.api.benchmarks import router as benchmarks_router
from app.api.metrics import router as metrics_router
from app.api.scenarios import router as scenarios_router

app = FastAPI(
    title="AstraPulse API",
    description="Predictive AI workload orchestration simulation API",
    version="0.1.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Set ALLOWED_ORIGINS to a comma-separated list of allowed frontend origins.
# Example: https://astrapulse.vercel.app,https://astrapulse-git-main-advait.vercel.app
# In development the Vite dev proxy handles CORS so this is only needed in production.
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# Always allow localhost for local development
_dev_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
allowed_origins = list(dict.fromkeys(allowed_origins + _dev_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(health_router, prefix="/api")
app.include_router(workers_router, prefix="/api")
app.include_router(scheduling_router, prefix="/api")
app.include_router(benchmarks_router, prefix="/api")
app.include_router(metrics_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    """Return basic API information."""
    return {
        "name": "AstraPulse API",
        "status": "running",
        "docs": "/docs",
    }
