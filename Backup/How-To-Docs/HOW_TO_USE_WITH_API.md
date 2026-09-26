# Using the App with the Results API

This guide explains how to run the Python API alongside the study app so your quiz scores are automatically saved and viewable.

---

## Table of Contents

1. [What the API Adds](#what-the-api-adds)
2. [Setup (one time)](#setup-one-time)
3. [Running Both Together](#running-both-together)
4. [How Scores Are Saved Automatically](#how-scores-are-saved-automatically)
5. [Viewing Your Scores](#viewing-your-scores)
6. [Filtering Your Results](#filtering-your-results)
7. [Checking Your Overall Stats](#checking-your-overall-stats)
8. [Deleting a Result](#deleting-a-result)
9. [Your Score File](#your-score-file)
10. [Troubleshooting](#troubleshooting)

---

## What the API Adds

Without the API, the app works normally but scores are never saved — they disappear when you close the browser.

With the API running alongside the app:

| Feature | Without API | With API |
|---------|-------------|----------|
| Flashcards | ✅ | ✅ |
| Quizzes | ✅ | ✅ |
| Live score counter | ✅ (Test Mode) | ✅ (Test Mode) |
| **Scores saved after session** | ❌ | ✅ |
| **View past scores** | ❌ | ✅ |
| **Average / best / worst score** | ❌ | ✅ |
| **Time taken per session** | ❌ | ✅ |

---

## Setup (one time)

Open a terminal in the `Prep App/` folder and install the required Python packages:

```
pip install -r api/results/requirements.txt
```

This only needs to be done once.

---

## Running Both Together

You need **two terminal windows** open at the same time.

**Terminal 1 — Study App (Frontend):**
```
python -m http.server 8080
```

**Terminal 2 — Results API:**
```
python -m uvicorn api.main:app --port 8000 --reload
```

Then open **http://localhost:8080** in your browser.

> Keep both terminals open while studying. Closing either one stops that part of the app.

---

## How Scores Are Saved Automatically

You don't need to do anything — it's fully automatic when:

1. ✅ **Test Mode is ON** (toggle on the intro screen)
2. ✅ **The API server is running** (Terminal 2 above)
3. ✅ **You answered at least one question**
4. ✅ **You click "Back"** to return to the intro screen

The moment you click **Back**, the app silently sends your score to the API. You won't see any notification — it happens in the background.

> **Flashcard sessions are never saved** — only multiple-choice quizzes in Test Mode.

---

## Viewing Your Scores

Open your browser and go to:

**http://localhost:8000/results**

You'll see a JSON list of all saved sessions, newest first:

```json
{
  "total_returned": 3,
  "results": [
    {
      "id": 7,
      "submitted_at": "2026-05-31T14:30:00Z",
      "dataset_label": "Chapter 5",
      "total": 20,
      "correct": 17,
      "wrong": 2,
      "skipped": 1,
      "score_pct": 85.0,
      "time_taken_s": 340
    },
    ...
  ]
}
```

| Field | What it means |
|-------|--------------|
| `id` | Unique number for this result |
| `submitted_at` | When the session ended (UTC) |
| `dataset_label` | Which chapter or exam you did |
| `total` | Total questions in the session |
| `correct` | How many you got right |
| `wrong` | How many you got wrong |
| `skipped` | Questions you didn't answer |
| `score_pct` | Your percentage score |
| `time_taken_s` | How many seconds the session took |

---

## Filtering Your Results

Add filters to the URL to narrow down what you see.

**Only show results for a specific chapter:**
```
http://localhost:8000/results?dataset_label=Chapter 3
```

**Only show mock exam results:**
```
http://localhost:8000/results?dataset_label=Mock
```

**Show only the 5 most recent results:**
```
http://localhost:8000/results?limit=5
```

**Combine filters:**
```
http://localhost:8000/results?dataset_label=Chapter&limit=10
```

---

## Checking Your Overall Stats

Go to:

**http://localhost:8000/results/summary**

You'll see your overall statistics across all sessions:

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

| Field | What it means |
|-------|--------------|
| `total_sessions` | How many test-mode quizzes you've completed |
| `avg_score_pct` | Your average score across all sessions |
| `best_score_pct` | Your best score ever |
| `worst_score_pct` | Your worst score ever |
| `total_correct` | Total correct answers across all sessions |
| `total_wrong` | Total wrong answers across all sessions |
| `total_questions_answered` | Grand total questions attempted |

---

## Deleting a Result

If you want to remove a result, you need its `id` number (shown in the results list).

You can delete it using the **interactive docs page**:

1. Go to **http://localhost:8000/docs**
2. Click **DELETE /results/{result_id}**
3. Click **Try it out**
4. Enter the `id` number
5. Click **Execute**

> ⚠️ Deletion is permanent and cannot be undone.

---

## Your Score File

All scores are stored in a single file on your computer:

```
Prep App/
└── api/
    └── results/
        └── results.db    ← all your scores live here
```

**To back up your scores:** copy `results.db` somewhere safe.

**To reset all scores:** delete `results.db`. It will be automatically recreated (empty) the next time the API starts.

Nothing is sent to the internet — your data stays on your machine.

---

## Troubleshooting

### Scores aren't being saved

Work through this checklist:

- [ ] Is the API server running? (check Terminal 2 shows `Application startup complete`)
- [ ] Was **Test Mode** turned on before starting the quiz?
- [ ] Did you answer at least one question?
- [ ] Did you click **Back** (not just close the browser tab)?

---

### "Cannot connect" or scores silently not saving

The API server isn't running. Start it:
```
python -m uvicorn api.main:app --port 8000
```

---

### `pip install` failed

Try upgrading pip first, then retry:
```
python -m pip install --upgrade pip
pip install -r api/results/requirements.txt
```

---

### Port 8000 is already in use

Either change the port:
```
python -m uvicorn api.main:app --port 8001
```

Or find and stop the process already using it (Windows):
```
netstat -ano | findstr :8000
taskkill /PID <number shown> /F
```

> If you change the port, also update the URL in `Frontend/js/services/ResultsService.js` — change `http://localhost:8000` to match your new port.

---

### I want to explore the API without writing code

Go to **http://localhost:8000/docs** — this is an interactive page where you can click any endpoint, fill in fields, and see real responses directly in the browser.

