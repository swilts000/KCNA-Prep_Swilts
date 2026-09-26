/**
 * views/IntroView.js
 * Manages all DOM interactions for the intro / landing screen.
 * Exposes render helpers and event-binding methods only —
 * zero business logic lives here.
 */
export default class IntroView {
  /** @type {Object} Raw DOM element references */
  #els;

  /** @param {Object} els – all required DOM elements */
  constructor(els) {
    this.#els = els;
  }

  // ── Visibility ────────────────────────────────────────────────────────────

  show() { this.#els.introScreen.classList.remove('hidden'); }
  hide() { this.#els.introScreen.classList.add('hidden'); }

  // ── Status text ───────────────────────────────────────────────────────────

  /** @param {string} message */
  setStatus(message) {
    this.#els.introStatus.textContent = message;
  }

  // ── Dataset selects ───────────────────────────────────────────────────────

  /**
   * Populate a <select> element with dataset entries.
   * @param {HTMLSelectElement} select
   * @param {Array<{label: string}>} entries
   */
  populateSelect(select, entries) {
    select.innerHTML = '';
    entries.forEach((entry, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = entry.label;
      select.appendChild(option);
    });
  }

  /** Show / hide the flashcard chapter selector. */
  showFlashcardSelect(visible) {
    this.#els.flashcardSelectWrap.classList.toggle('hidden', !visible);
  }

  /** Show / hide the quiz chapter selector. */
  showQuizSelect(visible) {
    this.#els.quizSelectWrap.classList.toggle('hidden', !visible);
  }

  // ── Counts & button states ─────────────────────────────────────────────────

  /** @param {number} count */
  setFlashcardCount(count) {
    this.#els.cardCount.textContent = `${count} flashcards ready`;
  }

  /** @param {number} count */
  setQuizCount(count) {
    this.#els.quizCount.textContent = `${count} quiz questions ready`;
  }

  /** @param {boolean} ready */
  setStartButtonReady(ready) {
    this.#els.startButton.disabled = !ready;
    this.#els.startButton.classList.toggle('is-ready', ready);
  }

  /** @param {boolean} ready */
  setQuizButtonReady(ready) {
    this.#els.quizButton.disabled = !ready;
    this.#els.quizButton.classList.toggle('is-ready', ready);
  }

  /**
   * Toggle the "60 questions" option for mock-exam datasets.
   * @param {boolean} isMock
   * @param {string}  currentCountValue
   */
  setMockExamOption(isMock, currentCountValue) {
    const opt = this.#els.quizCount60Option;
    if (!opt) return;
    opt.hidden   = !isMock;
    opt.disabled = !isMock;
    opt.setAttribute('aria-hidden', String(!isMock));
    if (!isMock && currentCountValue === '60') {
      this.#els.quizCountSelect.value = '20';
    }
  }

  // ── DOM accessors (read-only, used by AppController) ──────────────────────

  get flashcardSelect()  { return this.#els.flashcardSelect; }
  get quizSelect()       { return this.#els.quizSelect; }
  get quizCountSelect()  { return this.#els.quizCountSelect; }
  get flashcardShuffle() { return this.#els.flashcardShuffle; }
  get quizShuffle()      { return this.#els.quizShuffle; }
  get testModeToggle()   { return this.#els.testModeToggle; }

  // ── Event bindings ─────────────────────────────────────────────────────────

  onStartFlashcards(handler) { this.#els.startButton.addEventListener('click', handler); }
  onStartQuiz(handler)       { this.#els.quizButton.addEventListener('click', handler); }

  onFlashcardSetChange(handler) {
    this.#els.flashcardSelect.addEventListener('change', handler);
  }
  onQuizSetChange(handler) {
    this.#els.quizSelect.addEventListener('change', handler);
  }
  onTestModeChange(handler) {
    this.#els.testModeToggle?.addEventListener('change', handler);
  }
}

