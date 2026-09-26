"""
api/main.py
===========
Application factory — equivalent to the frontend's js/app.js.

Single responsibility: create the FastAPI app, register middleware,
wire up the router, and trigger database initialisation on startup.
All route logic lives in api/controllers/.
All business logic lives in api/services/.
All data shapes live in api/models/.
All SQL lives in api/database/.

Run
---
    python -m uvicorn api.main:app --reload --port 8000
Interactive docs → http://localhost:8000/docs
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.database.connection import init_db
from api.controllers.results_controller import router as results_router

# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="KCNA Prep — Results API",
    description="Store and retrieve flashcard / quiz session results.",
    version="2.0.0",
)

# Allow the frontend (any localhost port or file://) to reach the API.
# Tighten allow_origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup() -> None:
    """Ensure the SQLite schema exists before the first request is served."""
    init_db()

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(results_router)
