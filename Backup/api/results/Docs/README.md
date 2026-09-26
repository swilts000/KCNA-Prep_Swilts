# KCNA Prep — Results API Docs

Welcome! This folder contains a small Python web server (called an **API**) that saves and retrieves your quiz scores. You don't need to be a programmer to understand what it does — this document explains everything in plain English.

---

## Table of Contents

1. [What Is an API?](#what-is-an-api)
2. [What Does This API Do?](#what-does-this-api-do)
3. [How to Start the Server](#how-to-start-the-server)
4. [Exploring the API in Your Browser](#exploring-the-api-in-your-browser)
5. [Endpoints — Plain English Guide](#endpoints--plain-english-guide)
6. [Example Requests & Responses](#example-requests--responses)
7. [What Gets Saved?](#what-gets-saved)
8. [Where Is My Data Stored?](#where-is-my-data-stored)
9. [How the Frontend Talks to the API](#how-the-frontend-talks-to-the-api)
10. [File Overview](#file-overview)
11. [Common Errors & Fixes](#common-errors--fixes)

---

## What Is an API?

Think of an API like a **waiter at a restaurant**.

- **You** (the browser / study app) are the customer.
- **The API** is the waiter.
- **The database** is the kitchen.

You tell the waiter what you want ("save my quiz score", "show me my results"). The waiter takes that request to the kitchen, gets what you asked for, and brings it back to you — without you ever needing to go into the kitchen yourself.

---

## What Does This API Do?

In plain terms: **it remembers your quiz scores**.

Every time you finish a quiz in **Test Mode** and click "Back", the study app quietly sends your score to this API. The API saves it to a file on your computer. Later, you can ask the API to show you:

- All your past scores
- Your best and worst score
- Your average score across all sessions
- How long you took each time

---

## How to Start the Server

You need to run the API server **before** it can save any scores. Here's how:

**Step 1 — Open a terminal** (PowerShell on Windows, Terminal on Mac/Linux)

**Step 2 — Navigate to the Prep App folder:**
```
cd "C:\Users\YourName\...\Prep App"
```

**Step 3 — Install the required libraries** (only needed once):
```
pip install -r api/results/requirements.txt
```

**Step 4 — Start the server:**
```
python -m uvicorn api.main:app --port 8000 --host 0.0.0.0 --reload
```

You should see something like:
```
INFO:  Application startup complete.
INFO:  Uvicorn running on http://0.0.0.0:8000
```

✅ The server is now running. **Leave this terminal open** — closing it stops the server.

> **`--reload`** means the server will automatically restart if you edit any Python files. You can leave it out if you're not changing code.

---

## Exploring the API in Your Browser

Once the server is running, open your browser and go to:

**http://localhost:8000/docs**

This opens an **interactive page** (called Swagger UI) where you can:
- See every available endpoint
- Read what each one does
- Click "Try it out" to test them **without writing any code**

It looks like this:

```
┌─────────────────────────────────────────┐
│  KCNA Prep — Results API                │
├─────────────────────────────────────────┤
│  POST  /results       Submit a result   │
│  GET   /results       List all results  │
│  GET   /results/summary  Overall stats  │
│  GET   /results/{id}  One result by id  │
│  DELETE /results/{id} Delete a result   │
└─────────────────────────────────────────┘
```

---

## Endpoints — Plain English Guide

An **endpoint** is just a URL address that does a specific job. Think of each one as a different "button" you can press.

---

### `POST /results` — Save a new score

**What it does:** Saves one quiz session result to the database.

**When it's called:** Automatically called by the study app when you finish a test-mode quiz and click "Back".

**What you send it:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | text | ✅ | Always `"multiple-choice"` for quizzes |
| `dataset_label` | text | ✅ | Chapter or exam name, e.g. `"Chapter 3"` |
| `test_mode` | true/false | ✅ | Was Test Mode turned on? |
| `total` | number | ✅ | How many questions were in the session |
| `correct` | number | ✅ | How many you got right |
| `wrong` | number | ✅ | How many you got wrong |
| `time_taken_s` | number | ❌ | How many seconds the session took (optional) |

**What it gives back:** The saved result, including the auto-calculated `score_pct` (your percentage) and `skipped` count.

---

### `GET /results` — See all your scores

**What it does:** Returns a list of all saved quiz results, newest first.

**Optional filters you can add to the URL:**

| Filter | Example | Description |
|--------|---------|-------------|
| `mode` | `?mode=multiple-choice` | Only show quiz results |
| `dataset_label` | `?dataset_label=Chapter` | Only show results matching this name |
| `limit` | `?limit=10` | How many results to return (default: 50) |
| `offset` | `?offset=10` | Skip the first N results (for paging) |

**Example URL:** `http://localhost:8000/results?dataset_label=Mock&limit=5`

---

### `GET /results/summary` — Your overall statistics

**What it does:** Calculates totals and averages across **all** your saved results.

**What it gives back:**

| Field | Description |
|-------|-------------|
| `total_sessions` | How many quiz sessions you've completed |
| `avg_score_pct` | Your average score across all sessions |
| `best_score_pct` | Your highest score ever |
| `worst_score_pct` | Your lowest score ever |
| `total_correct` | Total correct answers across all sessions |
| `total_wrong` | Total wrong answers across all sessions |
| `total_questions_answered` | Grand total of questions attempted |

---

### `GET /results/{id}` — Look up one specific result

**What it does:** Returns a single saved result using its unique ID number.

**Example:** `http://localhost:8000/results/3` returns the result with ID 3.

If that ID doesn't exist, you get a `404 Not Found` error.

---

### `DELETE /results/{id}` — Delete a result

**What it does:** Permanently removes one result from the database.

**Example:** Sending a DELETE request to `http://localhost:8000/results/3` removes result #3.

> ⚠️ This cannot be undone.

---

## Example Requests & Responses

### Saving a result

**You send:**
```json
{
  "mode": "multiple-choice",
  "dataset_label": "Chapter 5",
  "test_mode": true,
  "total": 20,
  "correct": 17,
  "wrong": 2
}
```

**You get back:**
```json
{
  "id": 7,
  "submitted_at": "2026-05-31T14:30:00Z",
  "mode": "multiple-choice",
  "dataset_label": "Chapter 5",
  "test_mode": true,
  "total": 20,
  "correct": 17,
  "wrong": 2,
  "skipped": 1,
  "score_pct": 85.0,
  "time_taken_s": null
}
```

Notice the API **automatically calculated**:
- `skipped`: `20 - 17 - 2 = 1`
- `score_pct`: `(17 / 20) × 100 = 85.0`

---

### Getting your summary

**You visit:** `http://localhost:8000/results/summary`

**You get back:**
```json
{
  "total_sessions": 12,
  "avg_score_pct": 78.5,
  "best_score_pct": 95.0,
  "worst_score_pct": 55.0,
  "total_correct": 183,
  "total_wrong": 42,
  "total_questions_answered": 240
}
```

---

## What Gets Saved?

Every time a test-mode quiz session ends, the following is recorded:

```
┌──────────────────────────────────────────────────────────┐
│  Session Result                                          │
├──────────────────────┬───────────────────────────────────┤
│  When                │  2026-05-31T14:30:00Z             │
│  Mode                │  multiple-choice                  │
│  Chapter / Exam      │  Chapter 3                        │
│  Test Mode           │  Yes                              │
│  Total Questions     │  20                               │
│  Correct             │  16                               │
│  Wrong               │  3                                │
│  Skipped             │  1  (calculated automatically)    │
│  Score               │  80%  (calculated automatically)  │
│  Time Taken          │  4 minutes 12 seconds             │
└──────────────────────┴───────────────────────────────────┘
```

> **Note:** Results are only saved when **Test Mode is ON**. Free-practice sessions are not recorded.

---

## Where Is My Data Stored?

All results are saved in a file called **`results.db`** inside the `api/` folder:

```
Prep App/
└── api/
    └── results.db   ← your scores live here
```

This is a **SQLite database** — a single self-contained file, like a spreadsheet, that lives on your computer. Nothing is sent to the internet. You can back it up by simply copying this file.

> If you delete `results.db`, all saved scores are permanently gone. The file is re-created automatically the next time you start the server, but it will be empty.

---

## How the Frontend Talks to the API

You don't need to do anything manually — the study app handles this for you automatically.

Here's what happens behind the scenes:

```
1. You turn on Test Mode in the study app
2. You complete a quiz session
3. You click "Back"
          ↓
4. The app collects:
     - your score (correct / wrong / total)
     - the chapter name
     - how long you studied
          ↓
5. The app sends this to: POST http://localhost:8000/results
          ↓
6. The API saves it to results.db
          ↓
7. You can view it at: GET http://localhost:8000/results
```

If the API server isn't running when you click "Back", the score is simply not saved — the study app will not crash or show an error.

---

## File Overview

```
api/
├── main.py                        ← The web server entry point
├── models/
│   └── result.py                  ← Data shape definitions
├── controllers/
│   └── results_controller.py      ← URL route handlers
├── services/
│   └── results_service.py         ← Business logic
├── database/
│   └── connection.py              ← SQLite read/write
└── results/
    ├── results.db                 ← Your saved scores (auto-created)
    ├── requirements.txt           ← Python packages needed
    └── Docs/
        └── README.md              ← This file
```

### What each file does in plain terms

| File | Plain English |
|------|---------------|
| `main.py` | The front door of the API. Starts the server and points it at the routes. |
| `models/result.py` | A set of rules that check incoming data is valid before saving it. Like a form with required fields. |
| `controllers/results_controller.py` | Defines the URL addresses (endpoints) and what happens when you visit each one. |
| `services/results_service.py` | The decision-maker — figures out what to do with each request before touching the database. |
| `database/connection.py` | The filing cabinet. Handles storing and looking up results in `results.db`. |
| `results/requirements.txt` | A shopping list of Python packages. Run `pip install -r api/results/requirements.txt` to install them. |
| `results/results.db` | The actual file where all your scores are stored. |

---

## Common Errors & Fixes

### `[Errno 10048] Only one usage of each socket address`
**What it means:** The server is already running in another terminal window.
**Fix:** Close the duplicate terminal, or find and stop the other server process. You only need one running at a time.

---

### `ModuleNotFoundError: No module named 'fastapi'`
**What it means:** The required Python libraries aren't installed yet.
**Fix:** Run this in your terminal:
```
pip install -r api/results/requirements.txt
```

---

### Score not being saved after clicking "Back"
**What it means:** The API server probably isn't running.
**Fix:** Open a terminal and start the server:
```
python -m uvicorn api.main:app --port 8000
```
Then try again.

---

### `404 Not Found` on `/results/{id}`
**What it means:** There is no result with that ID number.
**Fix:** Use `GET /results` first to see which IDs exist.

---

### `422 Unprocessable Entity`
**What it means:** The data you sent was invalid — for example, `correct + wrong` is greater than `total`, or a required field is missing.
**Fix:** Check the request body matches the format described in the [Endpoints section](#endpoints--plain-english-guide) above.

---

*This API was built with [FastAPI](https://fastapi.tiangolo.com/) and stores data using SQLite — both are free and open source.*

