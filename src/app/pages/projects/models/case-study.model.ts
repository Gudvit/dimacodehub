/** The project's poster: a picture of the product, shown on its tile (not on its page). */
export interface CaseStudyCover {
  /** A relative path into `public/`, so it resolves under the base href. */
  readonly src: string;
  readonly alt: string;
}

/** One area of the work under its own subheading, for a case with more than one story. */
export interface CaseStudyArea {
  readonly title: string;
  readonly items: readonly string[];
}

/**
 * A case study. The page reads in three steps: the task (when there is one), what I did, the result — then
 * hindsight. Text goes through interpolation — no HTML (same rule as the blog, ADR 0005).
 */
export interface CaseStudy {
  readonly slug: string;
  /** Client work (the default) or a project of my own. */
  readonly kind?: "client" | "side";
  readonly title: string;
  /** A shorter name for the tile's hover, when the title is too long there. The page keeps `title`. */
  readonly tileTitle?: string;
  /** What the product is, in a few words: the line under the title on the card. */
  readonly tagline?: string;
  /** The result in one sentence: the description for search and sharing (not shown on the page). */
  readonly summary: string;
  readonly cover?: CaseStudyCover;
  /** The live product, when it can be visited. */
  readonly site?: string;
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly stack: readonly string[];
  /**
   * What the project was for and what made it hard, in one or two short paragraphs. Optional:
   * a case can open straight on what I did.
   */
  readonly task?: readonly string[];
  /**
   * What I did, one item each, starting with a verb ("Built…", "Moved…"). A trade-off worth
   * knowing goes after a dash in the same item. A long case groups them into areas, each
   * under a subheading; loose items before an area are listed without one.
   */
  readonly contributions: readonly (string | CaseStudyArea)[];
  /** What came of it, one item each; numbers go here. */
  readonly results: readonly string[];
  /** Hindsight. Optional, but it is what reads as senior. */
  readonly lessons?: readonly string[];
  /**
   * Work in progress. Shown by the dev server only, so a case can be built and reviewed in
   * the real page without ever reaching production.
   */
  readonly draft?: boolean;
  /**
   * Listed, but not written up yet: the tile is published (even while `draft`), and the page
   * says "Coming soon" instead of the text, which stays here to be finished. The dev server
   * shows the draft text at `?draft`.
   */
  readonly comingSoon?: boolean;
}
