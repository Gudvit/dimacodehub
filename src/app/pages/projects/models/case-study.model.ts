/** A headline number of a case study: what changed, said in one figure. */
export interface CaseStudyOutcome {
  readonly value: string;
  readonly label: string;
}

/** One decision that shaped the work, with the price that was paid for it. */
export interface CaseStudyDecision {
  readonly title: string;
  /** What was chosen and why. */
  readonly choice: string;
  /** What it cost, or what was given up. A decision without a trade-off is not one. */
  readonly tradeoff: string;
}

/** The project's poster: a picture of the product, shown on its card and atop its page. */
export interface CaseStudyCover {
  /** A relative path into `public/`, so it resolves under the base href. */
  readonly src: string;
  readonly alt: string;
}

/** A piece of work inside the project worth its own few lines. */
export interface CaseStudyHighlight {
  readonly title: string;
  readonly period?: string;
  readonly text: readonly string[];
}

/**
 * A case study. The fields follow the order a reviewer reads in: the result first, then the
 * problem, the constraints, the decisions and their trade-offs, and only then the details.
 * Text goes through interpolation — no HTML (same rule as the blog, ADR 0005).
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
  /** The result in one sentence. It is the page lead and the sharing description. */
  readonly summary: string;
  readonly cover?: CaseStudyCover;
  /** The live product, when it can be visited. */
  readonly site?: string;
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly stack: readonly string[];
  /** Two to four headline numbers. */
  readonly outcomes: readonly CaseStudyOutcome[];
  /** The situation and the problem, as paragraphs. */
  readonly context: readonly string[];
  /** What could not change: deadlines, legacy, team size, compliance. */
  readonly constraints: readonly string[];
  readonly decisions: readonly CaseStudyDecision[];
  /** What happened, as paragraphs. Numbers belong in `outcomes`; this is the story. */
  readonly results: readonly string[];
  /** Hindsight. Optional, but it is what reads as senior. */
  readonly lessons?: readonly string[];
  /** Smaller pieces of work inside the project, each told in a few lines. */
  readonly highlights?: readonly CaseStudyHighlight[];
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
