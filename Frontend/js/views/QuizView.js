/**
 * views/QuizView.js
 * Handles all DOM rendering for the multiple-choice quiz mode.
 * Receives an onAnswer callback from the controller — no score logic here.
 */
import { shuffleArray } from '../utils.js';

export default class QuizView {
  /** @type {Object} Raw DOM element references */
  #els;

  /** @param {Object} els */
  constructor(els) {
    this.#els = els;
  }

  // ── Visibility ─────────────────────────────────────────────────────────────

  /** Show the quiz panel and hide the flashcard panel. */
  show() {
    this.#els.quizWrap.classList.remove('hidden');
    this.#els.flashcardEl.classList.add('hidden');
  }

  hide() {
    this.#els.quizWrap.classList.add('hidden');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  /**
   * Render a single quiz question with shuffled answer options.
   * @param {{question:string, options:string[], correctIndex:number, explanation:string}} question
   * @param {number}  index
   * @param {number}  total
   * @param {boolean} isTestMode
   * @param {(selectedBtn: HTMLButtonElement, allBtns: HTMLButtonElement[], question: object) => void} onAnswer
   */
  render(question, index, total, isTestMode, onAnswer) {
    const { quizQuestionText, quizOptions, quizResultBadge, quizExplanation,
            progressText, helperText, studyStatus,
            prevButton, nextButton } = this.#els;

    const shuffled = shuffleArray(
      question.options.map((opt, i) => ({ text: opt, isCorrect: i === question.correctIndex }))
    );

    quizQuestionText.textContent  = question.question;
    progressText.textContent      = `Question ${index + 1} of ${total}`;
    helperText.textContent        = 'Choose the best answer.';
    studyStatus.classList.add('hidden');
    quizExplanation.classList.add('hidden');
    quizExplanation.textContent   = '';
    quizResultBadge.className     = 'quiz-result hidden';
    quizResultBadge.textContent   = '';

    prevButton.disabled    = isTestMode || index === 0;
    nextButton.textContent = index === total - 1 ? 'Restart' : 'Next';
    nextButton.disabled    = false;

    quizOptions.innerHTML = '';
    shuffled.forEach((opt) => {
      const btn       = document.createElement('button');
      btn.type        = 'button';
      btn.className   = 'quiz-option';
      btn.textContent = opt.text;
      btn.dataset.correct = String(opt.isCorrect);
      btn.addEventListener('click', () => {
        const allBtns = [...quizOptions.querySelectorAll('.quiz-option')];
        onAnswer(btn, allBtns, question);
      });
      quizOptions.appendChild(btn);
    });
  }

  // ── Answer result ──────────────────────────────────────────────────────────

  /**
   * Highlight the correct/wrong answer after selection.
   * @param {HTMLButtonElement}   selectedBtn
   * @param {HTMLButtonElement[]} allBtns
   * @param {object}              question
   * @param {boolean}             isCorrect
   */
  showAnswerResult(selectedBtn, allBtns, question, isCorrect) {
    const { quizResultBadge, quizExplanation, helperText } = this.#els;
    const correctBtn = allBtns.find((b) => b.dataset.correct === 'true');

    allBtns.forEach((b) => { b.disabled = true; });
    if (correctBtn) correctBtn.classList.add('is-correct');

    if (isCorrect) {
      selectedBtn.classList.add('is-correct');
      quizResultBadge.textContent = '✔';
      quizResultBadge.className   = 'quiz-result is-correct';
      helperText.textContent      = 'Correct. Use Next to continue.';
      quizExplanation.textContent = question.explanation;
    } else {
      selectedBtn.classList.add('is-wrong');
      quizResultBadge.textContent = '✘';
      quizResultBadge.className   = 'quiz-result is-wrong';
      helperText.textContent      = 'Incorrect. Review the explanation, then continue.';
      quizExplanation.textContent =
        `Correct answer: ${question.options[question.correctIndex]}. ${question.explanation}`;
    }

    quizExplanation.classList.remove('hidden');
    quizResultBadge.removeAttribute('aria-hidden');
  }
}

