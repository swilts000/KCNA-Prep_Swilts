"""
api/models/result.py
====================
Pydantic models that define the shape of data flowing in and out of the API.

This layer is equivalent to the frontend's js/models/ — it holds pure data
definitions with validation rules and no side-effects.

Classes
-------
ResultSubmit        Request body sent by the frontend (POST /results)
ResultResponse      Single result returned by the API
ResultsListResponse Paginated list of results
SummaryResponse     Aggregate statistics across all sessions
DeleteResponse      Confirmation payload for DELETE requests
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, computed_field, model_validator


# ── Request model ─────────────────────────────────────────────────────────────

class ResultSubmit(BaseModel):
    """
    Payload sent by the frontend when a study session ends.
    score_pct and skipped are derived — the client never sends them.
    """

    mode: Literal["flashcards", "multiple-choice"] = Field(
        description="Which study mode was used."
    )
    dataset_label: str = Field(
        min_length=1,
        description="Human-readable chapter or exam name, e.g. 'Chapter 3'.",
    )
    test_mode: bool = Field(
        description="Whether the session was a timed / test-mode session."
    )
    total: int = Field(ge=1, description="Total cards / questions in the session.")
    correct: int = Field(ge=0, description="Number answered correctly.")
    wrong: int = Field(ge=0, description="Number answered incorrectly.")
    time_taken_s: Optional[int] = Field(
        default=None,
        ge=0,
        description="Elapsed seconds (null for untimed sessions).",
    )

    @model_validator(mode="after")
    def _counts_are_consistent(self) -> ResultSubmit:
        if self.correct + self.wrong > self.total:
            raise ValueError("correct + wrong cannot exceed total.")
        return self

    @computed_field  # type: ignore[misc]
    @property
    def skipped(self) -> int:
        """Questions neither answered correctly nor incorrectly."""
        return self.total - self.correct - self.wrong

    @computed_field  # type: ignore[misc]
    @property
    def score_pct(self) -> float:
        """Percentage score, rounded to 2 decimal places."""
        return round((self.correct / self.total) * 100, 2)


# ── Response models ───────────────────────────────────────────────────────────

class ResultResponse(BaseModel):
    """A single stored result row."""

    id:            int
    submitted_at:  str
    mode:          str
    dataset_label: str
    test_mode:     bool
    total:         int
    correct:       int
    wrong:         int
    skipped:       int
    score_pct:     float
    time_taken_s:  Optional[int]

    model_config = {"from_attributes": True}


class ResultsListResponse(BaseModel):
    """Paginated collection of result rows."""

    total_returned: int
    limit:          int
    offset:         int
    results:        list[ResultResponse]


class SummaryResponse(BaseModel):
    """Aggregate statistics computed across all stored sessions."""

    total_sessions:           int
    avg_score_pct:            Optional[float]
    best_score_pct:           Optional[float]
    worst_score_pct:          Optional[float]
    total_correct:            int
    total_wrong:              int
    total_questions_answered: int


class DeleteResponse(BaseModel):
    """Returned after a successful DELETE request."""

    deleted: bool
    id:      int

