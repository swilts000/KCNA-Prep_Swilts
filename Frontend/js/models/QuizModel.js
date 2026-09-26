/**
 * models/QuizModel.js
 * Pure data model for the multiple-choice quiz set.
 * Owns the question pool and score counters — no DOM references.
 */
export default class QuizModel {
  #items = [];
  #correctCount = 0;
  #wrongCount   = 0;
  get items() { return [...this.#items]; }
  set items(val) { this.#items = Array.isArray(val) ? [...val] : []; }
  get ready() { return this.#items.length > 0; }
  get length() { return this.#items.length; }
  getAt(index) { return this.#items[index] ?? null; }
  get correctCount() { return this.#correctCount; }
  get wrongCount()   { return this.#wrongCount; }
  incrementCorrect() { this.#correctCount += 1; }
  incrementWrong()   { this.#wrongCount   += 1; }
  resetScore() { this.#correctCount = 0; this.#wrongCount = 0; }
}
