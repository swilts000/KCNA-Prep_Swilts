/**
 * services/ResultsService.js
 * Submits completed study-session results to the Python Results API.
 * All methods fail silently so a network error never disrupts the study UI.
 */
export default class ResultsService {
  /** @type {string} Base URL of the Python API (no trailing slash). */
  #baseUrl;

  /**
   * @param {string} [baseUrl] Defaults to the standard local dev port.
   */
  constructor(baseUrl = 'http://localhost:8000') {
    this.#baseUrl = baseUrl.replace(/\/+$/, '');
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Submit a completed quiz session result.
   *
   * @param {{
   *   mode:          'flashcards' | 'multiple-choice',
   *   dataset_label: string,
   *   test_mode:     boolean,
   *   total:         number,
   *   correct:       number,
   *   wrong:         number,
   *   time_taken_s?: number|null
   * }} result
   * @returns {Promise<object|null>} The saved result from the API, or null on error.
   */
  async submitResult(result) {
    try {
      const response = await fetch(`${this.#baseUrl}/results`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(result),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn(`ResultsService: POST /results failed (${response.status}): ${text}`);
        return null;
      }

      return await response.json();
    } catch (err) {
      console.warn('ResultsService: unable to reach API —', err.message);
      return null;
    }
  }

  /**
   * Fetch all stored results, optionally filtered.
   *
   * @param {{ mode?: string, dataset_label?: string, limit?: number, offset?: number }} [opts]
   * @returns {Promise<object|null>}
   */
  async getResults(opts = {}) {
    try {
      const params = new URLSearchParams();
      if (opts.mode)          params.set('mode',          opts.mode);
      if (opts.dataset_label) params.set('dataset_label', opts.dataset_label);
      if (opts.limit  != null) params.set('limit',  String(opts.limit));
      if (opts.offset != null) params.set('offset', String(opts.offset));

      const response = await fetch(`${this.#baseUrl}/results?${params}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('ResultsService: unable to reach API —', err.message);
      return null;
    }
  }

  /**
   * Fetch aggregate statistics across all stored sessions.
   * @returns {Promise<object|null>}
   */
  async getSummary() {
    try {
      const response = await fetch(`${this.#baseUrl}/results/summary`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('ResultsService: unable to reach API —', err.message);
      return null;
    }
  }
}

