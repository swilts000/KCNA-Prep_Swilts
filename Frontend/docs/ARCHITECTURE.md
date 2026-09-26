# Architecture — MVC + OOP

This document describes the full architecture of the KCNA Prep App, covering both the JavaScript frontend and the Python backend API.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Frontend — Layer Responsibilities](#frontend--layer-responsibilities)
3. [Frontend — File-by-File Reference](#frontend--file-by-file-reference)
4. [Frontend — Data Flow](#frontend--data-flow)
5. [Frontend — Screen Transition Lifecycle](#frontend--screen-transition-lifecycle)
6. [Frontend — Test Mode Lifecycle](#frontend--test-mode-lifecycle)
7. [Backend — Layer Responsibilities](#backend--layer-responsibilities)
8. [Backend — File-by-File Reference](#backend--file-by-file-reference)
9. [Backend — Data Flow](#backend--data-flow)
10. [Frontend ↔ Backend Integration](#frontend--backend-integration)
11. [Design Decisions](#design-decisions)
12. [Conventions](#conventions)

---

## Project Structure

```
Prep App/
│
├── index.html                          ← Single HTML entry point (served at root)
│
├── Frontend/                           ← All client-side code and assets
│   ├── css/
│   │   └── styles.css
│   ├── data/
│   │   ├── index.json                  ← Chapter manifest
│   │   ├── flashcards/                 ← Chapter_1.json … Chapter_11.json
│   │   └── multiple_choice/            ← Chapter_1.json … Chapter_11.json, Mock_Exam.json
│   ├── docs/                           ← You are here
│   │   ├── ARCHITECTURE.md
│   │   ├── RUNNING.md
│   │   └── README_JSON_FORMAT.md
│   └── js/
│       ├── app.js                      ← Entry point (1 line: new AppController())
│       ├── utils.js                    ← Pure helpers (shuffleArray)
│       ├── models/
│       │   ├── AppState.js
│       │   ├── FlashcardModel.js
│       │   └── QuizModel.js
│       ├── views/
│       │   ├── IntroView.js
│       │   ├── FlashcardView.js
│       │   ├── QuizView.js
│       │   └── StudyView.js
│       ├── controllers/
│       │   ├── AppController.js
│       │   ├── FlashcardController.js
│       │   └── QuizController.js
│       └── services/
│           ├── DatasetLoader.js        ← Fetches chapter JSON from Frontend/data/
│           ├── TimerService.js         ← Countdown timer
│           └── ResultsService.js       ← POSTs session scores to the Python API
│
└── api/                                ← Python FastAPI backend
    ├── main.py                         ← App factory (registers router, CORS, startup)
    ├── models/
    │   └── result.py                   ← Pydantic request / response schemas
    ├── controllers/
    │   └── results_controller.py       ← FastAPI router — all /results routes
    ├── services/
    │   └── results_service.py          ← Business logic, bridges controller ↔ database
    ├── database/
    │   └── connection.py               ← Raw SQLite CRUD, zero business logic
    └── results/
        ├── results.db                  ← SQLite database (auto-created)
        ├── requirements.txt            ← Python dependencies
        └── Docs/
            └── README.md              ← API usage guide (amateur-level)
```

---

## Frontend — Layer Responsibilities

### Models (`js/models/`)
- Hold **data and state only** — no methods that touch the DOM.
- All internal fields are **private** (`#field`) and exposed via typed getters/setters.
- `AppState` is the single source of truth for active mode, current index, test mode, and loaded datasets.
- `FlashcardModel` and `QuizModel` own their item arrays; `QuizModel` also tracks the session score.

### Views (`js/views/`)
- Accept a **single `els` object** of pre-resolved DOM elements in their constructor — they never call `document.getElementById` themselves.
- Expose two method categories:
  - **`render*()`** — push new data into the DOM.
  - **`on*(handler)`** — bind events and forward user actions to controllers via callbacks.
- Views never import models or other controllers.

### Controllers (`js/controllers/`)
- Receive dependencies (**model**, **view**, **state**) via constructor injection.
- `AppController` is the **composition root**: constructs every model, view, service, and sub-controller, then wires them together.
- Sub-controllers (`FlashcardController`, `QuizController`) each own one model + one view.

### Services (`js/services/`)
- `DatasetLoader` — all `fetch()` calls; resolves chapter files from `Frontend/data/`.
- `TimerService` — wraps `setInterval` with `onTick` / `onEnd` callbacks.
- `ResultsService` — POSTs completed test-mode session results to `http://localhost:8000`.

---

## Frontend — File-by-File Reference

### `Frontend/js/app.js`
```js
import AppController from './controllers/AppController.js';
new AppController();
```
Single responsibility: boot the app.

---

### `Frontend/js/utils.js`
| Export | Signature | Description |
|--------|-----------|-------------|
| `shuffleArray` | `(items: Array) → Array` | Fisher-Yates shuffle. Never mutates the input. |

---

### `Frontend/js/models/AppState.js`
| Member | Type | Description |
|--------|------|-------------|
| `activeMode` | `'flashcards' \| 'multiple-choice'` | Currently active study mode |
| `currentIndex` | `number` | Zero-based card / question index |
| `testMode` | `boolean` | Whether test-mode toggle is on |
| `datasets` | `{ flashcards: [], multipleChoice: [] }` | Loaded dataset metadata |
| `isFlashcardMode` | `boolean` (getter) | Alias for `activeMode === 'flashcards'` |

---

### `Frontend/js/models/FlashcardModel.js`
| Member | Description |
|--------|-------------|
| `items` (get/set) | Flashcard array — setter makes a shallow copy |
| `ready` | `true` when `items.length > 0` |
| `length` | Count of loaded flashcards |
| `getAt(index)` | Returns card at index or `null` |

---

### `Frontend/js/models/QuizModel.js`
| Member | Description |
|--------|-------------|
| `items` (get/set) | Question array |
| `ready` / `length` / `getAt(index)` | Same contract as `FlashcardModel` |
| `correctCount` / `wrongCount` | Read-only score counters |
| `incrementCorrect()` / `incrementWrong()` | Called by `QuizController` on each answer |
| `resetScore()` | Zeroes both counters |

---

### `Frontend/js/services/DatasetLoader.js`
| Method | Description |
|--------|-------------|
| `loadIndex()` | Fetches `Frontend/data/index.json`; falls back to legacy filenames on error |
| `loadDatasetFile(filename, key)` | Fetches one chapter JSON; normalises multiple key-name variants |
| `loadStudyData()` | Fetches all flashcard and multiple-choice files in parallel; returns `{ flashcards, multipleChoice }` |

---

### `Frontend/js/services/TimerService.js`
| Member | Description |
|--------|-------------|
| `start(seconds, { onTick, onEnd })` | Starts countdown; fires `onTick(remaining)` every second |
| `stop()` | Clears the interval and resets remaining to 0 |
| `remaining` / `isRunning` | Read-only state |
| `TimerService.formatTime(sec)` | Static — converts seconds to `"MM:SS"` |

---

### `Frontend/js/services/ResultsService.js`
| Method | Description |
|--------|-------------|
| `submitResult(result)` | `POST /results` — fire-and-forget; never throws |
| `getResults(opts)` | `GET /results` with optional filters |
| `getSummary()` | `GET /results/summary` |

---

### `Frontend/js/views/IntroView.js`
| Method | Description |
|--------|-------------|
| `show()` / `hide()` | Toggle intro screen visibility |
| `setStatus(message)` | Update status text |
| `populateSelect(select, entries)` | Rebuild a `<select>` from `[{ label }]` |
| `showFlashcardSelect(bool)` / `showQuizSelect(bool)` | Show/hide chapter selectors |
| `setFlashcardCount(n)` / `setQuizCount(n)` | Update ready-count labels |
| `setStartButtonReady(bool)` / `setQuizButtonReady(bool)` | Enable/disable mode buttons |
| `setMockExamOption(isMock, currentCount)` | Toggle the 60-question mock option |
| `onStartFlashcards(fn)` / `onStartQuiz(fn)` | Bind Start buttons |
| `onFlashcardSetChange(fn)` / `onQuizSetChange(fn)` | Bind chapter selects |
| `onTestModeChange(fn)` | Bind test-mode toggle |

---

### `Frontend/js/views/FlashcardView.js`
| Method | Description |
|--------|-------------|
| `show()` | Show flashcard panel, hide quiz panel |
| `render(card, index, total, isTestMode)` | Populate card, update progress + button states |
| `flip()` | Toggle `is-flipped` class and update helper text |
| `onFlip(fn)` | Bind click on card element |

---

### `Frontend/js/views/QuizView.js`
| Method | Description |
|--------|-------------|
| `show()` | Show quiz panel, hide flashcard panel |
| `render(question, index, total, isTestMode, onAnswer)` | Render question + shuffled options |
| `showAnswerResult(selectedBtn, allBtns, question, isCorrect)` | Highlight correct/wrong, show explanation |

---

### `Frontend/js/views/StudyView.js`
| Method | Description |
|--------|-------------|
| `show()` / `hide()` / `isVisible` | Toggle study screen |
| `showTimer(seconds)` / `hideTimer()` / `setTimerText(text)` | Timer display |
| `showTestCounters(bool)` / `updateCounters(correct, wrong)` | Score counter bar |
| `setPrevDisabled(bool)` / `setNextDisabled(bool)` | Navigation buttons |
| `showError(message)` / `showStatusMessage(message)` | Status / error display |
| `onBack(fn)` / `onNext(fn)` / `onPrev(fn)` | Bind navigation |

---

### `Frontend/js/controllers/FlashcardController.js`
| Method | Description |
|--------|-------------|
| `load(items)` | Replace the model's item array |
| `shuffle()` | In-place shuffle via `shuffleArray` |
| `render(index)` | Fetch card from model → call `view.render()` |
| `ready` / `length` | Proxied from the model |

Registers `view.onFlip()` in its constructor; guards flip against inactive mode.

---

### `Frontend/js/controllers/QuizController.js`
| Method | Description |
|--------|-------------|
| `load(items)` | Replace the model's item array |
| `resetScore()` | Zero model counters + refresh `StudyView` counters |
| `render(index)` | Fetch question → call `view.render()` with `#handleAnswer` callback |
| `correctCount` / `wrongCount` | Proxied from the model |
| `ready` / `length` | Proxied from the model |

`#handleAnswer` increments the model counter, updates `StudyView`, and calls `view.showAnswerResult()`.

---

### `Frontend/js/controllers/AppController.js`
The composition root. Key private methods:

| Method | Description |
|--------|-------------|
| `#buildViews()` | Resolves all DOM elements once; distributes shared `els` to all four views |
| `#buildControllers()` | Instantiates sub-controllers with injected models, views, and state |
| `#bindEvents()` | Wires all view `on*()` callbacks to handler methods |
| `#init()` | `async` — loads datasets, populates selects, primes controllers |
| `#applySelectedDataset(mode)` | Reads the active drop-down and loads it into the matching controller |
| `#goToStudyMode(mode)` | Hides intro → shows study → optionally shuffles/slices pool → renders |
| `#goToIntroMode()` | Submits session result → hides study → shows intro → stops timer |
| `#submitSessionResult()` | Fire-and-forget POST to Results API (test-mode quiz sessions only) |
| `#prepareQuizPool()` | Applies shuffle + count-selection; starts 90-min timer for mock exams |
| `#render()` | Delegates to the active sub-controller's `render(currentIndex)` |
| `#showNextCard()` / `#showPreviousCard()` | Advance/retreat index with wrap-around |
| `#stopTimer()` | Stops `TimerService` and hides the timer display |

---

## Frontend — Data Flow

```
User interaction (click / change)
         │
         ▼
      View.on*()             ← view fires registered callback
         │
         ▼
   Controller method         ← validates, updates model, decides what to render
         │
         ├──► Model          ← state is mutated (items, index, scores)
         │
         └──► View.render*() ← DOM is updated to reflect new model state
```

No view ever reads from a model directly. All data passes through the controller.

---

## Frontend — Screen Transition Lifecycle

```
App boot
  └─► AppController constructor
        ├─► #buildViews()        — resolve DOM, create view instances
        ├─► #buildControllers()  — inject models + views into sub-controllers
        ├─► #bindEvents()        — register all event listeners
        └─► #init()              — async: fetch JSON → populate selects → prime controllers
              └─► introScreen shown (default)

User clicks "Start Flashcards" or "Start Quiz"
  └─► #goToStudyMode(mode)
        ├─► AppState updated (activeMode, currentIndex, testMode)
        ├─► IntroView.hide() + StudyView.show()
        ├─► sessionStart timestamp recorded
        ├─► (optional) shuffle / slice pool
        └─► #render() → FlashcardController.render(0) or QuizController.render(0)

User clicks "Back"
  └─► #goToIntroMode()
        ├─► #submitSessionResult()  — POST score to API (test mode only)
        ├─► StudyView.hide() + IntroView.show()
        └─► TimerService.stop()
```

---

## Frontend — Test Mode Lifecycle

```
User enables Test Mode (intro screen)
  └─► AppState.testMode = true
  └─► QuizController.resetScore() → QuizModel.resetScore() + StudyView.updateCounters(0,0)

User starts quiz in test mode
  └─► StudyView.showTestCounters(true)
  └─► StudyView.setPrevDisabled(true)      ← no going back
  └─► (mock 60-question) TimerService.start(90 * 60, { onTick, onEnd })

User selects answer
  └─► QuizController.#handleAnswer()
        ├─► QuizModel.incrementCorrect() or .incrementWrong()
        └─► StudyView.updateCounters(correct, wrong)

Timer reaches zero
  └─► StudyView.setTimerText('00:00')
  └─► StudyView.setNextDisabled(true)
  └─► StudyView.showStatusMessage('Time is up. Test ended.')

User clicks "Back"
  └─► ResultsService.submitResult({ mode, dataset_label, correct, wrong, total, time_taken_s })
  └─► TimerService.stop() + StudyView.hideTimer()
```

---

## Backend — Layer Responsibilities

### Models (`api/models/`)
- Pydantic classes that define the **shape and validation rules** for data entering and leaving the API.
- Computed fields (`score_pct`, `skipped`) are derived automatically — the client never sends them.
- Equivalent to the frontend's `js/models/` — pure data definitions, no I/O.

### Database (`api/database/`)
- Raw SQLite CRUD using the Python stdlib `sqlite3` module — **no ORM**.
- Every function takes plain dicts and returns plain dicts.
- Equivalent to the frontend's `DatasetLoader` — handles I/O only, zero business logic.

### Services (`api/services/`)
- Translate Pydantic models → dicts for the database layer, and raw rows → Pydantic responses back.
- Own any business rules that don't belong in a route or a schema.
- Equivalent to the frontend's sub-controllers (`QuizController`, `FlashcardController`).

### Controllers (`api/controllers/`)
- FastAPI `APIRouter` with one file per resource.
- Receive a request, delegate everything to the service layer, return the HTTP response.
- Equivalent to the frontend's `AppController` — handles incoming events, delegates work.

### `api/main.py`
- App factory only: create the `FastAPI` instance, register CORS middleware, include routers, trigger `init_db()` on startup.
- Equivalent to the frontend's `js/app.js`.

---

## Backend — File-by-File Reference

### `api/main.py`
| Responsibility | Detail |
|----------------|--------|
| App factory | Creates `FastAPI` instance with title and version |
| CORS | `allow_origins=["*"]` — tighten in production |
| Startup hook | Calls `init_db()` to ensure the SQLite schema exists |
| Router registration | `app.include_router(results_router)` |

---

### `api/models/result.py`
| Class | Description |
|-------|-------------|
| `ResultSubmit` | Incoming POST body — validates counts, computes `skipped` and `score_pct` |
| `ResultResponse` | Single result row returned to the client |
| `ResultsListResponse` | Paginated list wrapper |
| `SummaryResponse` | Aggregate stats across all sessions |
| `DeleteResponse` | Confirmation returned after DELETE |

---

### `api/database/connection.py`
| Function | Description |
|----------|-------------|
| `init_db()` | Creates the `results` table if it doesn't exist |
| `insert_result(data)` | Inserts one row, returns new `id` |
| `fetch_result_by_id(id)` | Returns one row dict or `None` |
| `fetch_results(mode, dataset_label, limit, offset)` | Paginated + filtered read |
| `fetch_aggregate_summary()` | Returns COUNT, AVG, MAX, MIN, SUM across all rows |
| `delete_result(id)` | Deletes one row, returns `True` if found |

Database file path: `api/results/results.db`

---

### `api/services/results_service.py`
| Function | Description |
|----------|-------------|
| `create_result(payload)` | Converts `ResultSubmit` → dict → DB insert → `ResultResponse` |
| `list_results(...)` | Calls `fetch_results`, wraps in `ResultsListResponse` |
| `get_result(id)` | Calls `fetch_result_by_id`, returns `ResultResponse` or `None` |
| `get_summary()` | Calls `fetch_aggregate_summary`, returns `SummaryResponse` |
| `remove_result(id)` | Calls `delete_result`, returns `DeleteResponse` or `None` |

---

### `api/controllers/results_controller.py`
| Route | Method | Description |
|-------|--------|-------------|
| `/results` | `POST` | Submit a session result → calls `create_result()` |
| `/results` | `GET` | List results (filterable, paginated) → calls `list_results()` |
| `/results/summary` | `GET` | Aggregate stats → calls `get_summary()` |
| `/results/{id}` | `GET` | Single result → calls `get_result()`, 404 on None |
| `/results/{id}` | `DELETE` | Remove result → calls `remove_result()`, 404 on None |

---

## Backend — Data Flow

```
HTTP Request
      │
      ▼
  Controller          ← validates route params, calls service
      │
      ▼
   Service            ← applies business rules, calls database
      │
      ▼
  Database            ← executes SQL, returns plain dicts
      │
      ▼
   Service            ← converts dicts to Pydantic response models
      │
      ▼
  Controller          ← returns HTTP response to client
```

---

## Frontend ↔ Backend Integration

```
User finishes a test-mode quiz → clicks "Back"
           │
           ▼
  AppController.#goToIntroMode()
           │
           ▼
  AppController.#submitSessionResult()
    builds payload: { mode, dataset_label, test_mode, total, correct, wrong, time_taken_s }
           │
           ▼
  ResultsService.submitResult(payload)
    POST http://localhost:8000/results
           │
           ▼  (network)
  results_controller.submit_result(payload)
           │
           ▼
  results_service.create_result(payload)
           │
           ▼
  database.insert_result(data)  →  results.db
```

The frontend **never crashes** if the API is offline — `ResultsService` catches all errors silently.

---

## Design Decisions

### Why a `Frontend/` directory?
Separates all browser-facing code from the Python backend. `index.html` lives at the root (so Docker / a web server can serve it directly), while all JS, CSS, and data assets live under `Frontend/`.

### Why a shared `els` object across all views?
All four views share some DOM elements (`progressText`, `helperText`, `prevButton`). Resolving them once in `AppController.#buildViews()` and passing the same object to every view means DOM lookups happen once at boot, not per-render.

### Why does `AppController` hold `#quizModel` directly?
`#prepareQuizPool()` must read the **full** dataset before slicing it. `QuizController` only knows the active slice, so `AppController` keeps the model reference for pre-slice reads. The model is still only *mutated* through `QuizController.load()`.

### Why is `TimerService` in `AppController` and not `QuizController`?
The timer drives global UI changes (timer display in `StudyView`, disabling Next). Keeping it in `AppController` avoids `QuizController` needing a `StudyView` reference, which would break layer separation.

### Why SQLite and not a full database?
This is a local study tool. SQLite requires zero setup, produces a single portable file (`results.db`), and handles the expected query volume with ease. Upgrading to PostgreSQL later requires only changing `connection.py`.

### Why no event-emitter / pub-sub?
The app is small enough that direct callback injection keeps the dependency graph explicit and traceable. An event bus would add indirection without benefit at this scale.

---

## Conventions

### JavaScript

| Convention | Rule |
|------------|------|
| **Private fields** | All internal state uses `#field` — never `this._field` |
| **Constructor injection** | Dependencies are passed in; classes never `new` their own (except `AppController`) |
| **Immutable model reads** | Model getters return shallow copies (`[...this.#items]`) |
| **One file, one class** | Every file exports exactly one `default` class |
| **No DOM in models** | Models must not reference `document`, `window`, or any HTML element |
| **No logic in views** | Views only render data they are given; never import models or controllers |
| **`on*` naming** | All event-binding methods on views are prefixed `on` |
| **`render*` / `show*` / `hide*` naming** | All DOM-update methods on views use these prefixes |

### Python

| Convention | Rule |
|------------|------|
| **No ORM** | All SQL is written explicitly in `database/connection.py` |
| **Pydantic for I/O** | All data entering or leaving the API is validated by a Pydantic model |
| **Services own business logic** | Controllers never contain `if/else` business rules — they delegate to services |
| **Database returns plain dicts** | The database layer never imports Pydantic — conversion happens in the service |
| **No `__init__.py`** | Python 3.3+ namespace packages; `__init__.py` files are not needed |

