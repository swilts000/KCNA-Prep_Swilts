"""
api/controllers/results_controller.py
======================================
FastAPI router for all /results endpoints.

This layer is the equivalent of the frontend's js/controllers/ — it handles
incoming requests, delegates all work to the service layer, and returns
the appropriate HTTP response. Zero business logic or SQL lives here.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from api.models.result import (
    ResultSubmit,
    ResultResponse,
    ResultsListResponse,
    SummaryResponse,
    DeleteResponse,
)
from api.services.results_service import (
    create_result,
    list_results,
    get_result,
    get_summary,
    remove_result,
)

router = APIRouter(prefix="/results", tags=["Results"])


# ── POST /results ─────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=ResultResponse,
    status_code=201,
    summary="Submit a session result",
)
def submit_result(payload: ResultSubmit) -> ResultResponse:
    """
    Called by the frontend when a test-mode quiz session ends.

    `score_pct` and `skipped` are calculated automatically from the
    submitted `correct`, `wrong`, and `total` values — do not send them.
    """
    return create_result(payload)


# ── GET /results ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=ResultsListResponse,
    summary="List results",
)
def index_results(
    mode: str | None = Query(
        default=None,
        description="Filter by mode: 'flashcards' or 'multiple-choice'.",
    ),
    dataset_label: str | None = Query(
        default=None,
        description="Partial match on dataset / chapter label.",
    ),
    limit:  int = Query(default=50, ge=1, le=500, description="Page size."),
    offset: int = Query(default=0,  ge=0,          description="Page offset."),
) -> ResultsListResponse:
    """
    Return a paginated list of stored results, newest first.
    Optionally filter by `mode` and/or `dataset_label`.
    """
    return list_results(mode=mode, dataset_label=dataset_label,
                        limit=limit, offset=offset)


# ── GET /results/summary ──────────────────────────────────────────────────────

@router.get(
    "/summary",
    response_model=SummaryResponse,
    summary="Aggregate statistics",
)
def summary() -> SummaryResponse:
    """
    Return aggregate statistics across **all** stored sessions:
    total sessions, average / best / worst score, and cumulative counts.
    """
    return get_summary()


# ── GET /results/{id} ─────────────────────────────────────────────────────────

@router.get(
    "/{result_id}",
    response_model=ResultResponse,
    summary="Get a single result",
)
def show_result(result_id: int) -> ResultResponse:
    """Return one result by its numeric id."""
    result = get_result(result_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Result {result_id} not found.",
        )
    return result


# ── DELETE /results/{id} ──────────────────────────────────────────────────────

@router.delete(
    "/{result_id}",
    response_model=DeleteResponse,
    summary="Delete a result",
)
def destroy_result(result_id: int) -> DeleteResponse:
    """Permanently remove a result by id."""
    response = remove_result(result_id)
    if response is None:
        raise HTTPException(
            status_code=404,
            detail=f"Result {result_id} not found.",
        )
    return response

