/**
 * services/TimerService.js
 * Encapsulates countdown timer logic.
 * Fires onTick(secondsRemaining) every second and onEnd() when done.
 */
export default class TimerService {
  #timerId  = null;
  #remaining = 0;
  get remaining() { return this.#remaining; }
  get isRunning() { return this.#timerId !== null; }
  /**
   * Start a countdown from `seconds`.
   * @param {number} seconds
   * @param {{ onTick?: (s:number)=>void, onEnd?: ()=>void }} callbacks
   */
  start(seconds, { onTick, onEnd } = {}) {
    this.stop();
    this.#remaining = seconds;
    onTick?.(this.#remaining);
    this.#timerId = setInterval(() => {
      this.#remaining -= 1;
      if (this.#remaining <= 0) {
        this.stop();
        onEnd?.();
        return;
      }
      onTick?.(this.#remaining);
    }, 1000);
  }
  /** Stop and reset the timer. */
  stop() {
    if (this.#timerId) {
      clearInterval(this.#timerId);
      this.#timerId = null;
    }
    this.#remaining = 0;
  }
  /**
   * Format seconds as MM:SS.
   * @param {number} sec
   * @returns {string}
   */
  static formatTime(sec) {
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
