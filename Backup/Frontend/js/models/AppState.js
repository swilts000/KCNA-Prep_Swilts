/**
 * models/AppState.js
 * Central application state object.
 * No DOM references — consumed by controllers to coordinate views.
 */
export default class AppState {
  #activeMode    = 'flashcards'; // 'flashcards' | 'multiple-choice'
  #currentIndex  = 0;
  #testMode      = false;
  /** Loaded dataset metadata from DatasetLoader. */
  datasets = { flashcards: [], multipleChoice: [] };
  get activeMode()    { return this.#activeMode; }
  set activeMode(val) { this.#activeMode = val; }
  get currentIndex()    { return this.#currentIndex; }
  set currentIndex(val) { this.#currentIndex = Number(val); }
  get testMode()    { return this.#testMode; }
  set testMode(val) { this.#testMode = Boolean(val); }
  /** Convenience check — true when activeMode is flashcards. */
  get isFlashcardMode() { return this.#activeMode === 'flashcards'; }
}
