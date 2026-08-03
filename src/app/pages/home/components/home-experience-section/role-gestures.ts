/**
 * Gesture arithmetic for the experience section, kept out of the component: none of it
 * touches Angular, and all of it is about thresholds that only make sense together.
 *
 * The component stays responsible for what the decision means — calling `preventDefault`,
 * moving the active role — so these classes never see an event or the DOM.
 */

/** What the wheel handler should do with an event. */
export type WheelDecision =
  /** Not ours: let the page have it, untouched. */
  | "ignore"
  /** Ours, but not enough movement yet: swallow it. */
  | "block"
  /** The section is done scrolling: hand the wheel to the page. */
  | "release"
  | "previous"
  | "next";

export type SwipeDecision = "none" | "previous" | "next";

/** Movement needed before a wheel gesture switches the role. */
const WHEEL_THRESHOLD_PX = 84;
/** Quiet period after a switch, so one flick does not skip two roles. */
const WHEEL_COOLDOWN_MS = 360;
/** Extra budget spent at the first/last role before the page may scroll on. */
const EDGE_EXIT_THRESHOLD_PX = 170;
/** Movement needed before a touch gesture counts as a swipe. */
const SWIPE_THRESHOLD_PX = 40;

export class WheelNavigator {
  private accumulator = 0;
  private lockedUntil = 0;
  private edgeExitAccumulator = 0;
  private edgeExitDirection: 1 | -1 | null = null;

  /**
   * @param index active role
   * @param count number of roles
   * @param now monotonic time, for the cooldown
   */
  decide(deltaX: number, deltaY: number, index: number, count: number, now: number): WheelDecision {
    if (Math.abs(deltaY) <= Math.abs(deltaX)) {
      return "ignore";
    }

    const direction = deltaY > 0 ? 1 : -1;
    const atEdge = direction > 0 ? index === count - 1 : index === 0;

    if (atEdge) {
      return this.spendEdgeBudget(direction, Math.abs(deltaY));
    }

    this.edgeExitAccumulator = 0;
    this.edgeExitDirection = null;

    if (now < this.lockedUntil) {
      return "block";
    }

    this.accumulator += deltaY;
    if (Math.abs(this.accumulator) < WHEEL_THRESHOLD_PX) {
      return "block";
    }

    this.accumulator = 0;
    this.lockedUntil = now + WHEEL_COOLDOWN_MS;
    return direction > 0 ? "next" : "previous";
  }

  /**
   * On the first and last role the wheel is held back until the visitor insists. Without
   * it, one trackpad flick would fly past the whole section.
   */
  private spendEdgeBudget(direction: 1 | -1, distance: number): WheelDecision {
    if (this.edgeExitDirection !== direction) {
      this.edgeExitDirection = direction;
      this.edgeExitAccumulator = 0;
    }

    this.edgeExitAccumulator += distance;
    if (this.edgeExitAccumulator < EDGE_EXIT_THRESHOLD_PX) {
      return "block";
    }

    this.edgeExitAccumulator = 0;
    this.edgeExitDirection = null;
    this.accumulator = 0;
    this.lockedUntil = 0;
    return "release";
  }
}

export class SwipeTracker {
  private startX: number | null = null;
  private startY: number | null = null;
  private sawHorizontal = false;

  start(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.sawHorizontal = false;
  }

  move(x: number, y: number): void {
    if (this.startX === null || this.startY === null) {
      return;
    }

    if (Math.abs(x - this.startX) > Math.abs(y - this.startY)) {
      this.sawHorizontal = true;
    }
  }

  cancel(): void {
    this.startX = null;
    this.startY = null;
    this.sawHorizontal = false;
  }

  /** Only intentional horizontal swipes count — vertical scrolling must not switch roles. */
  end(x: number, y: number): SwipeDecision {
    if (this.startX === null || this.startY === null) {
      return "none";
    }

    const deltaX = x - this.startX;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(y - this.startY);
    const horizontal = this.sawHorizontal || absX > absY;

    this.cancel();

    if (!horizontal || absX < SWIPE_THRESHOLD_PX || absX <= absY) {
      return "none";
    }

    return deltaX < 0 ? "next" : "previous";
  }
}
