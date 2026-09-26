"""
api/services/results_service.py
================================
Business logic for result operations.

This layer sits between the controller (routes) and the database (raw SQL).
It is responsible for:
  - Translating Pydantic models into plain dicts for the database layer
  - Translating raw database rows back into Pydantic response models
  - Enforcing any business rules that don't belong in the model or the route

Equivalent to the frontend's js/controllers/ sub-controllers
(FlashcardController, QuizController) — mediates between data and presentation.
"""

from __future__ import annotations

from api.database.connection import (
    insert_result,
    delete_result,
    fetch_result_by_id,
    fetch_results,
    fetch_aggregate_summary,
)
from api.models.result import (
    ResultSubmit,
    ResultResponse,
    ResultsListResponse,
    SummaryResponse,
    DeleteResponse,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _row_to_response(row: dict) -> ResultResponse:
    """Convert a raw database row dict into a typed ResultResponse."""
    return ResultResponse(
        id=row["id"],
        submitted_at=row["submitted_at"],
        mode=row["mode"],
        dataset_label=row["dataset_label"],
        test_mode=bool(row["test_mode"]),
        total=row["total"],
        correct=row["correct"],
        wrong=row["wrong"],
        skipped=row["skipped"],
        score_pct=row["score_pct"],
        time_taken_s=row["time_taken_s"],
    )


# ── Service methods ───────────────────────────────────────────────────────────

def create_result(payload: ResultSubmit) -> ResultResponse:
    """
    Persist a new session result and return the saved record.
    score_pct and skipped are computed by the Pydantic model before saving.
    """
    row_data = {
        "mode":          payload.mode,
        "dataset_label": payload.dataset_label,
        "test_mode":     int(payload.test_mode),
        "total":         payload.total,
        "correct":       payload.correct,
        "wrong":         payload.wrong,
        "skipped":       payload.skipped,
        "score_pct":     payload.score_pct,
        "time_taken_s":  payload.time_taken_s,
    }
    new_id = insert_result(row_data)
    row    = fetch_result_by_id(new_id)
    return _row_to_response(row)


def list_results(
    mode: str | None          = None,
    dataset_label: str | None = None,
    limit: int                = 50,
    offset: int               = 0,
) -> ResultsListResponse:
    """
    Return a paginated, optionally-filtered list of results.
    dataset_label uses a partial (LIKE) match.
    """
    rows = fetch_results(
        mode=mode,
        dataset_label=dataset_label,
        limit=limit,
        offset=offset,
    )
    return ResultsListResponse(
        total_returned=len(rows),
        limit=limit,
        offset=offset,
        results=[_row_to_response(r) for r in rows],
    )


def get_result(result_id: int) -> ResultResponse | None:
    """
    Return one result by id, or None if it does not exist.
    The controller decides what HTTP status to return on None.
    """
    row = fetch_result_by_id(result_id)
    return _row_to_response(row) if row else None


def get_summary() -> SummaryResponse:
    """Return aggregate statistics across all stored sessions."""
    data = fetch_aggregate_summary()
    return SummaryResponse(
        total_sessions=data["total_sessions"] or 0,
        avg_score_pct=data["avg_score_pct"],
        best_score_pct=data["best_score_pct"],
        worst_score_pct=data["worst_score_pct"],
        total_correct=data["total_correct"] or 0,
        total_wrong=data["total_wrong"] or 0,
        total_questions_answered=data["total_questions_answered"] or 0,
    )


def remove_result(result_id: int) -> DeleteResponse | None:
    """
    Delete a result by id.
    Returns a DeleteResponse on success, or None if the row did not exist.
    """
    deleted = delete_result(result_id)
    return DeleteResponse(deleted=True, id=result_id) if deleted else None

