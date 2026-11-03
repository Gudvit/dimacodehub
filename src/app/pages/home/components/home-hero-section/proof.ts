export interface ProofMetric {
  readonly value: string;
  readonly label: string;
}

export interface ProofCompany {
  readonly name: string;
  /**
   * A logo under `public/`, as a relative path (`images/companies/apomedical.svg`) — it is
   * loaded through `<img src>`, so it needs the stable URL `public/` gives. Without one the
   * name is set as a wordmark in the same style as the others.
   */
  readonly logo?: string;
}

/**
 * The proof strip under the hero. Content lives in code — see
 * docs/architecture/0005-content-in-code.md. The numbers are the site-wide ones agreed in
 * docs/roadmap.md (0.2); change them there first.
 */
export const PROOF_METRICS: readonly ProofMetric[] = [
  { value: "10+", label: "years in frontend" },
  { value: "100K+", label: "users reached" },
  { value: "5+", label: "large-scale products" },
];

export const PROOF_COMPANIES: readonly ProofCompany[] = [
  { name: "Apomedical", logo: "images/companies/apomeds.svg" },
  { name: "IdeaSoft", logo: "images/companies/ideasoft.svg" },
  { name: "Lazy Ants", logo: "images/companies/lazy-ants.svg" },
];
