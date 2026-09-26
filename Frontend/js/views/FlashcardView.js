/**
 * views/FlashcardView.js
 * Handles all DOM rendering for the flashcard study mode.
 * Zero business logic — just shows/hides elements and updates text.
 */
export default class FlashcardView {
  /** @type {Object} Raw DOM element references */
  #els;

  /** @param {Object} els */
  constructor(els) {
    this.#els = els;
  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  /** Show the flashcard panel and hide the quiz panel. */
  show() {
    this.#els.flashcardEl.classList.remove('hidden');
    this.#els.quizWrap.classList.add('hidden');
    this.#els.questionText.textContent = '';
    this.#els.answerText.textContent   = '';
  }

  hide() {
    this.#els.flashcardEl.classList.add('hidden');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  /**
   * Render a single flashcard into the DOM.
   * @param {{question:string, answer:string}} card
   * @param {number}  index
   * @param {number}  total
   * @param {boolean} isTestMode
   */
  render(card, index, total, isTestMode) {
    const { flashcardEl, questionText, answerText, progressText,
            helperText, studyStatus, quizExplanation,
            prevButton, nextButton } = this.#els;

    questionText.textContent = card.question;
    answerText.textContent   = card.answer;
    progressText.textContent = `Card ${index + 1} of ${total}`;
    helperText.textContent   = 'Click the card to reveal the answer.';

    flashcardEl.classList.remove('is-flipped');
    flashcardEl.disabled = false;
    studyStatus.classList.add('hidden');
    quizExplanation.classList.add('hidden');

    prevButton.disabled    = isTestMode || index === 0;
    nextButton.textContent = index === total - 1 ? 'Restart' : 'Next';
    nextButton.disabled    = false;
  }

  // ── Flip ───────────────────────────────────────────────────────────────────

  /** Toggle the card flip and update helper text accordingly. */
  flip() {
    const { flashcardEl, helperText } = this.#els;
    const isFlipped = flashcardEl.classList.toggle('is-flipped');
    helperText.textContent = isFlipped
      ? 'Answer revealed. Use Next to continue.'
      : 'Click the card to reveal the answer.';
  }

  // ── Event bindings ─────────────────────────────────────────────────────────

  /** @param {() => void} handler */
  onFlip(handler) {
    this.#els.flashcardEl.addEventListener('click', handler);
  }
}

