"""
api/database/connection.py
==========================
Raw SQLite connection and CRUD helpers.

This layer knows nothing about FastAPI, Pydantic, or business rules.
It only speaks SQL — every function takes plain dicts and returns plain dicts.
Equivalent to the frontend's DatasetLoader: handles I/O, nothing else.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

# Database file lives in api/results/
DB_PATH = Path(__file__).parent.parent / "results" / "results.db"


def _connect() -> sqlite3.Connection:
    """Open a connection with dict-style row access and WAL mode for safe reads."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


# ── Schema ────────────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create the results table if it does not already exist."""
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                submitted_at  TEXT    NOT NULL
                                DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                mode          TEXT    NOT NULL,
                dataset_label TEXT    NOT NULL,
                test_mode     INTEGER NOT NULL,
                total         INTEGER NOT NULL,
                correct       INTEGER NOT NULL,
                wrong         INTEGER NOT NULL,
                skipped       INTEGER NOT NULL,
                score_pct     REAL    NOT NULL,
                time_taken_s  INTEGER
            )
        """)


# ── Write ─────────────────────────────────────────────────────────────────────

def insert_result(data: dict) -> int:
    """Insert one result row. Returns the new row id."""
    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO results
                (mode, dataset_label, test_mode, total, correct,
                 wrong, skipped, score_pct, time_taken_s)
            VALUES
                (:mode, :dataset_label, :test_mode, :total, :correct,
                 :wrong, :skipped, :score_pct, :time_taken_s)
            """,
            data,
        )
        return cur.lastrowid


def delete_result(result_id: int) -> bool:
    """Delete a row by id. Returns True if a row was removed."""
    with _connect() as conn:
        cur = conn.execute("DELETE FROM results WHERE id = ?", (result_id,))
        return cur.rowcount > 0


# ── Read ──────────────────────────────────────────────────────────────────────

def fetch_result_by_id(result_id: int) -> dict | None:
    """Return a single row as a dict, or None if not found."""
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM results WHERE id = ?", (result_id,)
        ).fetchone()
    return dict(row) if row else None


def fetch_results(
    mode: str | None          = None,
    dataset_label: str | None = None,
    limit: int                = 100,
    offset: int               = 0,
) -> list[dict]:
    """Return rows ordered by newest first, with optional filters."""
    clauses: list[str] = []
    params:  list      = []

    if mode:
        clauses.append("mode = ?")
        params.append(mode)
    if dataset_label:
        clauses.append("dataset_label LIKE ?")
        params.append(f"%{dataset_label}%")

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    params += [limit, offset]

    with _connect() as conn:
        rows = conn.execute(
            f"SELECT * FROM results {where} ORDER BY submitted_at DESC LIMIT ? OFFSET ?",
            params,
        ).fetchall()
    return [dict(r) for r in rows]


def fetch_aggregate_summary() -> dict:
    """Return aggregate stats across all rows."""
    with _connect() as conn:
        row = conn.execute("""
            SELECT
                COUNT(*)                         AS total_sessions,
                ROUND(AVG(score_pct),  2)        AS avg_score_pct,
                ROUND(MAX(score_pct),  2)        AS best_score_pct,
                ROUND(MIN(score_pct),  2)        AS worst_score_pct,
                SUM(correct)                     AS total_correct,
                SUM(wrong)                       AS total_wrong,
                SUM(total)                       AS total_questions_answered
            FROM results
        """).fetchone()
    return dict(row)

