/** Where a side project stands today. */
export type SideProjectStatus = "Live" | "In progress" | "Paused";

/** An outbound link of a side project: the product itself, its repository, a bot. */
export interface SideProjectLink {
  readonly label: string;
  readonly url: string;
}

/**
 * A project built outside client work. Lighter than a case study: what it is, why it exists
 * and what it is made of, with a picture. Text goes through interpolation — no HTML.
 */
export interface SideProject {
  readonly slug: string;
  readonly name: string;
  /** What it is, in one line. */
  readonly tagline: string;
  /** Why it exists and what is interesting in how it is built, as two or three sentences. */
  readonly description: string;
  /** A relative path into `public/`, so it resolves under the base href. */
  readonly image: string;
  readonly stack: readonly string[];
  readonly status: SideProjectStatus;
  readonly links: readonly SideProjectLink[];
  /** Shown by the dev server only, like a draft case study. */
  readonly draft?: boolean;
}
