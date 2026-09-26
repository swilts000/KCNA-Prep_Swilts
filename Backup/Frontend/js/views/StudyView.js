/**
 * views/StudyView.js
 * Manages the shared study-screen shell: toolbar, navigation buttons,
 * timer display, test counters, and error/status messages.
 * Zero business logic.
 */
import TimerService from '../services/TimerService.js';

export default class StudyView {
  /** @type {Object} Raw DOM element references */
  #els;

  /** @param {Object} els */
  constructor(els) {
    this.#els = els;
  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  show() { this.#els.studyScreen.classList.remove('hidden'); }
  hide() { this.#els.studyScreen.classList.add('hidden'); }

  /** True when the study screen is currently displayed. */
  get isVisible() {
    return !this.#els.studyScreen.classList.contains('hidden');
  }

  // ── Timer display ──────────────────────────────────────────────────────────

  /**
   * Update the timer display with a raw second count.
   * @param {number} seconds
   */
  showTimer(seconds) {
    const { timerDisplay } = this.#els;
    if (!timerDisplay) return;
    timerDisplay.textContent = TimerService.formatTime(seconds);
    timerDisplay.classList.remove('hidden');
  }

  hideTimer() {
    const { timerDisplay } = this.#els;
    if (!timerDisplay) return;
    timerDisplay.classList.add('hidden');
    timerDisplay.textContent = '';
  }

  /** Directly set timer label (e.g. "00:00" on expiry). */
  setTimerText(text) {
    if (this.#els.timerDisplay) this.#els.timerDisplay.textContent = text;
  }

  // ── Test-mode counters ─────────────────────────────────────────────────────

  /** @param {boolean} visible */
  showTestCounters(visible) {
    this.#els.testCounters?.classList.toggle('hidden', !visible);
    this.#els.testCounters?.setAttribute('aria-hidden', String(!visible));
  }

  /**
   * Refresh correct / wrong score display.
   * @param {number} correct
   * @param {number} wrong
   */
  updateCounters(correct, wrong) {
    if (this.#els.correctCountSpan) this.#els.correctCountSpan.textContent = String(correct);
    if (this.#els.wrongCountSpan)   this.#els.wrongCountSpan.textContent   = String(wrong);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** @param {boolean} disabled */
  setPrevDisabled(disabled) { this.#els.prevButton.disabled = disabled; }

  /** @param {boolean} disabled */
  setNextDisabled(disabled) { this.#els.nextButton.disabled = disabled; }

  // ── Error / status messages ────────────────────────────────────────────────

  /**
   * Render a full-screen error state inside the study panel.
   * @param {string} message
   */
  showError(message) {
    const { questionText, answerText, quizQuestionText, quizOptions,
            progressText, helperText, studyStatus, quizExplanation,
            quizResultBadge, flashcardEl, prevButton, nextButton } = this.#els;

    questionText.textContent     = 'No questions loaded';
    answerText.textContent       = 'Check your JSON file';
    quizQuestionText.textContent = 'No questions loaded';
    quizOptions.innerHTML        = '';
    progressText.textContent     = 'Card 0 of 0';
    helperText.textContent       = message;
    studyStatus.textContent      = message;
    studyStatus.classList.remove('hidden');
    quizExplanation.classList.add('hidden');
    quizResultBadge.className    = 'quiz-result hidden';
    flashcardEl.classList.remove('is-flipped');
    flashcardEl.disabled         = true;
    prevButton.disabled          = true;
    nextButton.disabled          = true;
  }

  /**
   * Show a non-fatal status message (e.g. timer ended).
   * @param {string} message
   */
  showStatusMessage(message) {
    const { studyStatus } = this.#els;
    studyStatus.textContent = message;
    studyStatus.classList.remove('hidden');
  }

  // ── Event bindings ─────────────────────────────────────────────────────────

  onBack(handler) { this.#els.backButton.addEventListener('click', handler); }
  onNext(handler) { this.#els.nextButton.addEventListener('click', handler); }
  onPrev(handler) { this.#els.prevButton.addEventListener('click', handler); }
}

