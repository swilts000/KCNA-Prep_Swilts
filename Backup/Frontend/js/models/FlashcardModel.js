/**
 * models/FlashcardModel.js
 * Pure data model for the flashcard study set.
 * No DOM references — only state and business rules.
 */
export default class FlashcardModel {
  /** @type {Array<{question: string, answer: string}>} */
  #items = [];

  /** @returns {Array} Shallow copy of the current flashcard array. */
  get items() {
    return [...this.#items];
  }

  /** Replace the flashcard array. */
  set items(val) {
    this.#items = Array.isArray(val) ? [...val] : [];
  }

  /** True when at least one flashcard is loaded. */
  get ready() {
    return this.#items.length > 0;
  }

  /** Number of loaded flashcards. */
  get length() {
    return this.#items.length;
  }

  /**
   * Retrieve a single flashcard by index.
   * @param {number} index
   * @returns {{question: string, answer: string}|null}
   */
  getAt(index) {
    return this.#items[index] ?? null;
  }
}

