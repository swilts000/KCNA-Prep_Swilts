/**
 * controllers/AppController.js
 * Root controller — bootstraps the entire application.
 *
 * Responsibilities:
 *  - Instantiate all models, views, sub-controllers, and services
 *  - Load study data via DatasetLoader
 *  - Coordinate screen transitions (intro ↔ study)
 *  - Manage navigation (next / previous card)
 *  - Drive the test-mode timer via TimerService
 */
import AppState           from '../models/AppState.js';
import FlashcardModel     from '../models/FlashcardModel.js';
import QuizModel          from '../models/QuizModel.js';
import DatasetLoader      from '../services/DatasetLoader.js';
import TimerService       from '../services/TimerService.js';
import IntroView          from '../views/IntroView.js';
import FlashcardView      from '../views/FlashcardView.js';
import QuizView           from '../views/QuizView.js';
import StudyView          from '../views/StudyView.js';
import FlashcardController from './FlashcardController.js';
import QuizController     from './QuizController.js';
import ResultsService    from '../services/ResultsService.js';
import { shuffleArray }   from '../utils.js';

export default class AppController {
  // ── State & services ───────────────────────────────────────────────────────
  #state   = new AppState();
  #loader  = new DatasetLoader();
  #timer   = new TimerService();
  #results = new ResultsService();

  /** Timestamp (ms) when the current session started — used to compute time_taken_s. */
  #sessionStart = 0;

  // ── Models ─────────────────────────────────────────────────────────────────
  #fcModel   = new FlashcardModel();
  #quizModel = new QuizModel();

  // ── Views ──────────────────────────────────────────────────────────────────
  #introView;
  #studyView;
  #flashcardView;
  #quizView;

  // ── Sub-controllers ────────────────────────────────────────────────────────
  #fcController;
  #quizController;

  constructor() {
    this.#buildViews();
    this.#buildControllers();
    this.#bindEvents();
    this.#init();          // async, intentionally not awaited in constructor
  }

  // ── Initialisation ─────────────────────────────────────────────────────────

  /** Collect every required DOM element and hand them to the view layer. */
  #buildViews() {
    const q   = (id) => document.getElementById(id);
    const els = {
      // ── intro screen
      introScreen:        q('introScreen'),
      introStatus:        q('introStatus'),
      cardCount:          q('cardCount'),
      quizCount:          q('quizCount'),
      startButton:        q('startButton'),
      quizButton:         q('quizButton'),
      flashcardSelectWrap: q('flashcardSelectWrap'),
      flashcardSelect:    q('flashcardSelect'),
      quizSelectWrap:     q('quizSelectWrap'),
      quizSelect:         q('quizSelect'),
      quizCountSelect:    q('quizCountSelect'),
      quizCount60Option:  q('quizCount60Option'),
      flashcardShuffle:   q('flashcardShuffle'),
      quizShuffle:        q('quizShuffle'),
      testModeToggle:     q('testModeToggle'),
      // ── study screen (shared)
      studyScreen:        q('studyScreen'),
      backButton:         q('backButton'),
      progressText:       q('progressText'),
      helperText:         q('helperText'),
      prevButton:         q('prevButton'),
      nextButton:         q('nextButton'),
      testCounters:       q('testCounters'),
      correctCountSpan:   q('correctCount'),
      wrongCountSpan:     q('wrongCount'),
      timerDisplay:       q('timerDisplay'),
      studyStatus:        q('studyStatus'),
      quizExplanation:    q('quizExplanation'),
      // ── flashcard panel
      flashcardEl:        q('flashcard'),
      questionText:       q('questionText'),
      answerText:         q('answerText'),
      // ── quiz panel
      quizWrap:           q('quizWrap'),
      quizQuestionText:   q('quizQuestionText'),
      quizOptions:        q('quizOptions'),
      quizResultBadge:    q('quizResultBadge'),
    };

    this.#introView     = new IntroView(els);
    this.#studyView     = new StudyView(els);
    this.#flashcardView = new FlashcardView(els);
    this.#quizView      = new QuizView(els);
  }

  #buildControllers() {
    this.#fcController = new FlashcardController(
      this.#fcModel, this.#flashcardView, this.#state,
    );
    this.#quizController = new QuizController(
      this.#quizModel, this.#quizView, this.#state, this.#studyView,
    );
  }

  /** Wire all user-initiated events to their handlers. */
  #bindEvents() {
    this.#introView.onStartFlashcards(() => this.#goToStudyMode('flashcards'));
    this.#introView.onStartQuiz(()       => this.#goToStudyMode('multiple-choice'));

    this.#introView.onFlashcardSetChange(() => {
      this.#applySelectedDataset('flashcards');
      this.#updateIntroStatus();
    });

    this.#introView.onQuizSetChange(() => {
      this.#applySelectedDataset('multiple-choice');
      this.#updateIntroStatus();
      this.#stopTimer();
    });

    this.#introView.onTestModeChange(() => {
      this.#state.testMode = this.#introView.testModeToggle?.checked ?? false;
      if (this.#state.testMode)  this.#quizController.resetScore();
      if (!this.#state.testMode) this.#stopTimer();
      this.#updateTestModeUI();
    });

    this.#studyView.onBack(() => this.#goToIntroMode());
    this.#studyView.onNext(() => this.#showNextCard());
    this.#studyView.onPrev(() => this.#showPreviousCard());
  }

  /** Fetch datasets, populate selects, and prime both controllers. */
  async #init() {
    const { flashcards: fcSets, multipleChoice: mcSets } =
      await this.#loader.loadStudyData();

    this.#state.datasets.flashcards    = fcSets;
    this.#state.datasets.multipleChoice = mcSets;

    this.#introView.populateSelect(this.#introView.flashcardSelect, fcSets);
    this.#introView.populateSelect(this.#introView.quizSelect,      mcSets);

    this.#introView.showFlashcardSelect(fcSets.length > 1);
    this.#introView.showQuizSelect(mcSets.length > 1);

    this.#applySelectedDataset('flashcards');
    this.#applySelectedDataset('multiple-choice');
    this.#updateIntroStatus();
  }

  // ── Dataset helpers ────────────────────────────────────────────────────────

  /**
   * Load whichever dataset entry is selected in the intro drop-down.
   * @param {'flashcards'|'multiple-choice'} mode
   */
  #applySelectedDataset(mode) {
    const isFlashcard = mode === 'flashcards';
    const entries = isFlashcard
      ? this.#state.datasets.flashcards
      : this.#state.datasets.multipleChoice;
    const select  = isFlashcard
      ? this.#introView.flashcardSelect
      : this.#introView.quizSelect;
    const entry   = entries[Number(select?.value) || 0] || { file: '', items: [] };

    if (isFlashcard) {
      this.#fcController.load(entry.items);
      this.#introView.setStartButtonReady(this.#fcController.ready);
      this.#introView.setFlashcardCount(entry.items.length);
    } else {
      this.#quizController.load(entry.items);
      this.#introView.setQuizButtonReady(this.#quizController.ready);
      this.#introView.setQuizCount(entry.items.length);
      const isMock = (entry.file || '').toLowerCase().includes('mock');
      this.#introView.setMockExamOption(
        isMock, this.#introView.quizCountSelect?.value,
      );
    }
  }

  // ── Status / UI helpers ────────────────────────────────────────────────────

  #updateIntroStatus() {
    const fc = this.#fcController.ready;
    const qz = this.#quizController.ready;
    if (fc && qz) {
      this.#introView.setStatus('Flashcards and multiple choice are ready.');
    } else if (fc) {
      this.#introView.setStatus('Flashcards are ready. No multiple-choice JSON detected.');
    } else if (qz) {
      this.#introView.setStatus('Multiple choice is ready. No flashcard JSON detected.');
    } else {
      this.#introView.setStatus(
        'No study JSON detected. Add flashcards.json or multiple-choice.json and reload.',
      );
    }
  }

  #updateTestModeUI() {
    const active      = this.#state.testMode;
    const studyVisible = this.#studyView.isVisible;
    this.#studyView.showTestCounters(active && studyVisible);
    if (!active || !studyVisible) this.#studyView.hideTimer();
    this.#studyView.setPrevDisabled(active && studyVisible);
  }

  // ── Screen transitions ─────────────────────────────────────────────────────

  /**
   * Switch to the study screen in the given mode.
   * @param {'flashcards'|'multiple-choice'} mode
   */
  #goToStudyMode(mode) {
    this.#state.activeMode   = mode;
    this.#state.currentIndex = 0;
    this.#state.testMode     = this.#introView.testModeToggle?.checked ?? false;

    this.#introView.hide();
    this.#studyView.show();
    this.#sessionStart = Date.now();

    if (this.#state.testMode) this.#quizController.resetScore();
    this.#updateTestModeUI();

    if (mode === 'flashcards' && this.#fcController.ready) {
      if (this.#introView.flashcardShuffle?.checked) this.#fcController.shuffle();
      this.#render();
    } else if (mode === 'multiple-choice' && this.#quizController.ready) {
      this.#prepareQuizPool();
      this.#render();
    } else {
      this.#studyView.showError(
        mode === 'multiple-choice'
          ? 'No multiple-choice JSON detected.'
          : 'No flashcards are available.',
      );
    }
  }

  #goToIntroMode() {
    this.#submitSessionResult();   // fire-and-forget
    this.#studyView.hide();
    this.#introView.show();
    this.#stopTimer();
    this.#updateTestModeUI();
  }

  /**
   * Build and POST a session result to the Results API.
   * Runs fire-and-forget — errors are logged but never surface to the user.
   */
  #submitSessionResult() {
    // Only submit if there is meaningful scored data
    if (!this.#state.testMode) return;
    if (this.#state.isFlashcardMode) return; // flashcards don't have a score

    const total   = this.#quizController.length;
    const correct = this.#quizController.correctCount;
    const wrong   = this.#quizController.wrongCount;
    if (total === 0 || (correct + wrong) === 0) return;

    const entries      = this.#state.datasets.multipleChoice;
    const select       = this.#introView.quizSelect;
    const entry        = entries[Number(select?.value) || 0] || { label: 'Unknown' };
    const time_taken_s = this.#sessionStart
      ? Math.round((Date.now() - this.#sessionStart) / 1000)
      : null;

    this.#results.submitResult({
      mode:          'multiple-choice',
      dataset_label: entry.label,
      test_mode:     true,
      total,
      correct,
      wrong,
      time_taken_s,
    });
  }

  // ── Quiz pool preparation ──────────────────────────────────────────────────

  /** Slice / shuffle the quiz pool according to the current intro-screen settings. */
  #prepareQuizPool() {
    const entries = this.#state.datasets.multipleChoice;
    const select  = this.#introView.quizSelect;
    const entry   = entries[Number(select?.value) || 0] || { file: '', items: [] };
    const isMock  = (entry.file || '').toLowerCase().includes('mock');

    // Always build the pool from the full raw dataset, not the model —
    // the model may already hold a sliced pool from a previous session.
    const pool = this.#introView.quizShuffle?.checked
      ? shuffleArray(entry.items)
      : [...entry.items];

    const countValue = this.#introView.quizCountSelect?.value || '20';

    if (countValue === 'all') {
      this.#quizController.load(pool);
      this.#stopTimer();
    } else if (countValue === '60' && isMock) {
      this.#quizController.load(pool.slice(0, Math.min(60, pool.length)));
      if (this.#state.testMode) {
        this.#timer.start(90 * 60, {
          onTick: (s) => this.#studyView.showTimer(s),
          onEnd:  ()  => {
            this.#studyView.setTimerText('00:00');
            this.#studyView.setNextDisabled(true);
            this.#studyView.showStatusMessage('Time is up. Test ended.');
          },
        });
      }
    } else {
      this.#quizController.load(pool.slice(0, Number(countValue)));
      this.#stopTimer();
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  #getActiveLength() {
    return this.#state.isFlashcardMode
      ? this.#fcController.length
      : this.#quizController.length;
  }

  #showNextCard() {
    const len = this.#getActiveLength();
    if (len === 0) return;
    this.#state.currentIndex =
      this.#state.currentIndex === len - 1 ? 0 : this.#state.currentIndex + 1;
    this.#render();
  }

  #showPreviousCard() {
    if (this.#getActiveLength() === 0 || this.#state.currentIndex === 0) return;
    this.#state.currentIndex -= 1;
    this.#render();
  }

  /** Delegate rendering to the appropriate sub-controller. */
  #render() {
    const idx = this.#state.currentIndex;
    if (this.#state.isFlashcardMode) {
      if (!this.#fcController.render(idx)) {
        this.#studyView.showError('No flashcards are available.');
      }
    } else {
      if (!this.#quizController.render(idx)) {
        this.#studyView.showError('No multiple-choice JSON detected.');
      }
    }
  }

  // ── Timer convenience ──────────────────────────────────────────────────────

  #stopTimer() {
    this.#timer.stop();
    this.#studyView.hideTimer();
  }
}

