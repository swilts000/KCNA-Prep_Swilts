# How to Use the KCNA Prep App

This guide explains how to use the app as a student — no technical knowledge required.

---

## Table of Contents

1. [Opening the App](#opening-the-app)
2. [The Intro Screen](#the-intro-screen)
3. [Studying with Flashcards](#studying-with-flashcards)
4. [Taking a Multiple-Choice Quiz](#taking-a-multiple-choice-quiz)
5. [Test Mode](#test-mode)
6. [The Mock Exam](#the-mock-exam)
7. [Tips for Studying](#tips-for-studying)

---

## Opening the App

1. Open a terminal in the `Prep App/` folder
2. Run a local web server:
   ```
   python -m http.server 8080
   ```
3. Open your browser and go to **http://localhost:8080**

> ⚠️ You cannot open `index.html` directly by double-clicking it — the app must be served over HTTP.

---

## The Intro Screen

When the app loads you'll see the **intro screen**. This is your home base.

```
┌──────────────────────────────────────────┐
│           KCNA Study App                 │
│                                          │
│  [Chapter dropdown]   Shuffle □          │
│  [Start Flashcards]                      │
│                                          │
│  [Chapter dropdown]   [How many? ▼]      │
│  Shuffle □   Test Mode □                 │
│  [Start Quiz]                            │
└──────────────────────────────────────────┘
```

| Control | What it does |
|---------|-------------|
| **Chapter dropdown** | Choose which chapter (or the mock exam) to study |
| **Shuffle** | Randomise the order of cards / questions |
| **How many?** | Pick how many quiz questions to attempt (10, 20, all…) |
| **Test Mode** | Hides the Previous button and tracks your score live |
| **Start Flashcards** | Begin a flashcard session |
| **Start Quiz** | Begin a multiple-choice quiz |

---

## Studying with Flashcards

1. Select a chapter from the **flashcard dropdown**
2. (Optional) tick **Shuffle** to randomise the order
3. Click **Start Flashcards**

### Controls

| Action | How |
|--------|-----|
| Reveal the answer | **Click the card** |
| Go to the next card | Click **Next** |
| Go back | Click **Prev** (disabled in Test Mode) |
| Return to the menu | Click **Back** |

The progress counter in the top bar shows **Card X of Y**.

When you reach the last card, **Next** becomes **Restart** — click it to loop back to the beginning.

---

## Taking a Multiple-Choice Quiz

1. Select a chapter from the **quiz dropdown**
2. Choose how many questions you want from the **How many?** dropdown
3. (Optional) tick **Shuffle** to randomise the question order
4. Click **Start Quiz**

### Answering questions

- Click one of the answer buttons
- The correct answer turns **green** ✔
- A wrong answer turns **red** ✘, and the correct answer is also highlighted
- An explanation appears below the options
- Click **Next** to move on

The progress counter shows **Question X of Y**.

---

## Test Mode

Test Mode simulates real exam conditions.

**How to enable it:** Tick the **Test Mode** checkbox on the intro screen before starting a quiz.

**What changes in Test Mode:**

| Feature | Normal | Test Mode |
|---------|--------|-----------|
| Previous button | ✅ Available | ❌ Disabled — no going back |
| Score counter | Hidden | ✅ Shown live (correct / wrong) |
| Score saved | No | ✅ Yes — saved to the Results API |
| Timer | No | ✅ Yes (Mock Exam only — 90 minutes) |

The live score counter in the top bar updates after every answer:

```
✔ Correct: 14    ✘ Wrong: 3
```

---

## The Mock Exam

The **Mock Exam** dataset simulates the real KCNA exam.

1. Select **Mock Exam** from the quiz chapter dropdown
2. Set **How many?** to **60** *(this option only appears for the Mock Exam)*
3. Tick **Test Mode** and **Shuffle**
4. Click **Start Quiz**

A **90-minute countdown timer** will start automatically. When time runs out:
- Navigation is disabled
- A "Time is up. Test ended." message appears
- Your score is saved automatically

---

## Tips for Studying

| Goal | Recommended approach |
|------|---------------------|
| Learn new material | Flashcards, no shuffle, no Test Mode |
| Reinforce memory | Flashcards with Shuffle on |
| Practice questions | Quiz, shuffle on, 20 questions |
| Simulate the exam | Mock Exam, 60 questions, Test Mode on, Shuffle on |
| Track your progress | Enable Test Mode — scores are saved automatically |

