/**
 * controllers/FlashcardController.js
 * Mediates between FlashcardModel and FlashcardView.
 * Handles flip interaction and delegates all rendering to the view.
 */
import { shuffleArray } from '../utils.js';

export default class FlashcardController {
  /** @type {import('../models/FlashcardModel.js').default} */
  #model;
  /** @type {import('../views/FlashcardView.js').default} */
  #view;
  /** @type {import('../models/AppState.js').default} */
  #state;

  /**
   * @param {import('../models/FlashcardModel.js').default} model
   * @param {import('../views/FlashcardView.js').default}   view
   * @param {import('../models/AppState.js').default}       state
   */
  constructor(model, view, state) {
    this.#model = model;
    this.#view  = view;
    this.#state = state;

    // Wire the flip interaction — guard against inactive mode
    this.#view.onFlip(() => {
      if (this.#state.isFlashcardMode && this.#model.ready) {
        this.#view.flip();
      }
    });
  }

  /** True when the model has at least one flashcard. */
  get ready() { return this.#model.ready; }

  /** Number of loaded flashcards. */
  get length() { return this.#model.length; }

  /**
   * Replace the loaded flashcard set.
   * @param {Array} items
   */
  load(items) {
    this.#model.items = items;
  }

  /** In-place shuffle of the current flashcard pool. */
  shuffle() {
    this.#model.items = shuffleArray(this.#model.items);
  }

  /**
   * Render the card at the given index.
   * @param {number} index
   * @returns {boolean} false if no cards are loaded
   */
  render(index) {
    if (!this.#model.ready) return false;
    const card = this.#model.getAt(index);
    this.#view.show();
    this.#view.render(card, index, this.#model.length, this.#state.testMode);
    return true;
  }
}

