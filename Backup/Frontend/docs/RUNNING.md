# Running the KCNA Prep App

There are two parts to the app:

| Part | What it does | Required? |
|------|-------------|-----------|
| **Frontend** | Serves `index.html` + the study UI | ✅ Always |
| **Python API** | Saves and retrieves quiz scores | ⚡ Only needed for score tracking |

---

## 1 — Running the Frontend

### Option A — Docker (recommended)

Build and serve everything in one command:

```bash
# From the Prep App/ root
docker-compose up --build
```

Then open **http://localhost:8080** in your browser.

Or manually with `docker run`:

```bash
docker build -t prep-app:latest .
docker run --rm -p 8080:80 prep-app:latest
```

---

### Option B — Any local web server

Because the app uses ES modules (`import`/`export`), you **cannot** open `index.html` directly from the filesystem (`file://`). You need a local HTTP server.

**Python (stdlib):**
```bash
# From the Prep App/ root
python -m http.server 8080
```

**Node (npx):**
```bash
npx serve . -p 8080
```

Then open **http://localhost:8080**.

---

## 2 — Running the Python API (Score Tracking)

The API is optional. If it isn't running, the study app works normally — scores just won't be saved.

### Install dependencies (once)

```bash
pip install -r api/results/requirements.txt
```

### Start the server

```bash
# From the Prep App/ root
python -m uvicorn api.main:app --port 8000 --host 0.0.0.0 --reload
```

The API will be available at **http://localhost:8000**.

Interactive docs (Swagger UI) → **http://localhost:8000/docs**

> Leave this terminal open while studying. The server stops when you close it.

---

## 3 — Running Both Together

Open **two terminals** from the `Prep App/` root:

**Terminal 1 — Frontend:**
```bash
python -m http.server 8080
```

**Terminal 2 — API:**
```bash
python -m uvicorn api.main:app --port 8000 --reload
```

Then open **http://localhost:8080**.

---

## Project Structure (quick reference)

```
Prep App/
├── index.html              ← Open this in your browser
├── Frontend/
│   ├── css/
│   ├── data/               ← Chapter JSON files
│   ├── docs/               ← Documentation (you are here)
│   └── js/                 ← All JavaScript (MVC)
└── api/                    ← Python FastAPI backend
    └── results/
        ├── results.db      ← Saved scores (auto-created)
        └── requirements.txt
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page / no flashcards | Open from a local server, not `file://` |
| Scores not saving | Start the Python API (`uvicorn api.main:app --port 8000`) |
| Port already in use | Change `8080` / `8000` to another port, or kill the existing process |
| `ModuleNotFoundError` | Run `pip install -r api/results/requirements.txt` |
