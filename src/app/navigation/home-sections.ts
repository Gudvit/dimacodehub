import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

/** A slide of the home page the header links to, by the id of its section. */
export interface HomeSection {
  readonly id: string;
  readonly label: string;
}

/** The header's menu: the home slides, in page order, starting with the hero. */
export const HOME_SECTIONS: readonly HomeSection[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
  { id: "contacts", label: "Contact" },
];

/**
 * The line between the header and the home page's slider. The home page owns all scrolling
 * (pages/home/CLAUDE.md); the header only says where it wants to go and shows where the
 * reader is.
 *
 * - `current` — the slide in view, kept by the home page while it is open, `null` elsewhere.
 * - `lastSection` — where the home page was left, for Back to return to.
 * - `requests` — "scroll to this slide". A header link also sets the URL fragment, but the
 *   router ignores a navigation to the URL it is already on, so a second click on the same
 *   link would otherwise do nothing.
 */
@Injectable({ providedIn: "root" })
export class HomeSectionsService {
  readonly current = signal<string | null>(null);

  /**
   * The slide the reader was on when they last left the home page. Back (the browser's, or a
   * swipe) returns to it: what scrolls is the slider, not the window, so the browser has no
   * scroll position of its own to restore.
   */
  lastSection: string | null = null;

  private readonly requestsSubject = new Subject<string>();
  readonly requests = this.requestsSubject.asObservable();

  request(id: string): void {
    this.requestsSubject.next(id);
  }
}
