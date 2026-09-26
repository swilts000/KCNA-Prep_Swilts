/**
 * controllers/QuizController.js
 * Mediates between QuizModel, QuizView, and StudyView.
 * Handles answer selection logic, score tracking, and counter updates.
 */
export default class QuizController {
  /** @type {import('../models/QuizModel.js').default} */
  #model;
  /** @type {import('../views/QuizView.js').default} */
  #view;
  /** @type {import('../models/AppState.js').default} */
  #state;
  /** @type {import('../views/StudyView.js').default} */
  #studyView;

  /**
   * @param {import('../models/QuizModel.js').default}    model
   * @param {import('../views/QuizView.js').default}      view
   * @param {import('../models/AppState.js').default}     state
   * @param {import('../views/StudyView.js').default}     studyView
   */
  constructor(model, view, state, studyView) {
    this.#model     = model;
    this.#view      = view;
    this.#state     = state;
    this.#studyView = studyView;
  }

  /** True when the model has at least one question. */
  get ready() { return this.#model.ready; }

  /** Number of loaded questions. */
  get length() { return this.#model.length; }

  /** Current session correct-answer count. */
  get correctCount() { return this.#model.correctCount; }

  /** Current session wrong-answer count. */
  get wrongCount() { return this.#model.wrongCount; }

  /**
   * Replace the loaded question set.
   * @param {Array} items
   */
  load(items) {
    this.#model.items = items;
  }

  /** Reset score counters and refresh the DOM counters. */
  resetScore() {
    this.#model.resetScore();
    this.#studyView.updateCounters(0, 0);
  }

  /**
   * Render the question at the given index.
   * @param {number} index
   * @returns {boolean} false if no questions are loaded
   */
  render(index) {
    if (!this.#model.ready) return false;
    const question = this.#model.getAt(index);
    this.#view.show();
    this.#view.render(
      question,
      index,
      this.#model.length,
      this.#state.testMode,
      (selectedBtn, allBtns, q) => this.#handleAnswer(selectedBtn, allBtns, q),
    );
    return true;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Process a user answer selection.
   * @param {HTMLButtonElement}   selectedBtn
   * @param {HTMLButtonElement[]} allBtns
   * @param {object}              question
   */
  #handleAnswer(selectedBtn, allBtns, question) {
    const isCorrect = selectedBtn.dataset.correct === 'true';

    if (this.#state.testMode) {
      if (isCorrect) {
        this.#model.incrementCorrect();
      } else {
        this.#model.incrementWrong();
      }
      this.#studyView.updateCounters(
        this.#model.correctCount,
        this.#model.wrongCount,
      );
    }

    this.#view.showAnswerResult(selectedBtn, allBtns, question, isCorrect);
  }
}

