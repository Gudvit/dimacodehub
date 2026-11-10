import type { BlogPost } from "./models/blog-post.model";

/**
 * Content lives in code — see docs/architecture/0005-content-in-code.md. Array order is
 * page order: a new post goes first. `blog.service.spec.ts` validates every entry.
 *
 * Drafts are visible on the dev server only. Placeholders in a draft are written as
 * `[TODO: …]` so they are easy to find and impossible to miss on the page.
 */
export const BLOG_POSTS: readonly BlogPost[] = [
  {
    // docs/blog-plan.md, post 1. Sources: ADR 0021, commit 37fcffa. [TODO] marks what only
    // the author can write; the code is real.
    slug: "lighthouse-blamed-my-animations",
    title: "Lighthouse Said My Animations Were Slow. They Weren't.",
    date: "2026-10-31",
    tags: ["Frontend", "Performance", "Lighthouse"],
    preview:
      "[TODO: one or two sentences — a 4.4 s LCP, a hero animation that looked guilty, and the uncompressed test server that was actually to blame.]",
    readingTime: 6,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. Lighthouse in CI, the home page under the performance budget, LCP around 4.4 s, and the obvious suspect: the hero's entrance animation.]",
          "[TODO: what this post is about — the number was real, the page it measured was not.]",
        ],
      },
      {
        heading: "The number that blamed the animation",
        paragraphs: [
          "[TODO: the scores you saw (performance in the 70s–80s on /, LCP ≈ 4.4 s) and why the animation looked guilty: the LCP element was the hero copy, and it fades in.]",
          "[TODO: the fix you almost shipped — starting the hero visible — and what it would have cost the design.]",
        ],
      },
      {
        heading: "How Lighthouse guesses a page load",
        paragraphs: [
          "[TODO: simulated throttling (Lantern) in plain words: Lighthouse loads the page fast, records the network and CPU graph, then estimates how long it would take on a slow phone and network.]",
          "[TODO: the consequence — on that simulated network, bytes on the wire dominate. A JavaScript bundle that is four times bigger delays everything that waits for it, LCP included.]",
        ],
      },
      {
        heading: "The experiment",
        paragraphs: [
          "[TODO: animation removed → still slow. That ruled it out.]",
          "[TODO: the difference between the test stand and production: a small Node server sending the build raw, GitHub Pages sending text gzipped. Gzip on → 95–98 with the original code.]",
        ],
      },
      {
        heading: "Serving the build the way Pages does",
        paragraphs: [
          "[TODO: the fix lives in the audit script, not in the site: the local server now compresses what Pages compresses — text, not images or PDFs, which are compressed already.]",
        ],
        code: {
          language: "typescript",
          source: `/** What GitHub Pages compresses: text. Images and PDFs are compressed already. */
const COMPRESSED = new Set([".html", ".js", ".css", ".json", ".svg", ".xml"]);

const server = createServer((request, response) => {
  // … resolve the file under <base href>, fall back to 404.html …
  const gzip =
    COMPRESSED.has(extname(served)) && /\\bgzip\\b/.test(request.headers["accept-encoding"] ?? "");
  response.writeHead(found ? 200 : 404, {
    "content-type": TYPES[extname(served)] ?? "application/octet-stream",
    ...(gzip && { "content-encoding": "gzip" }),
  });
  response.end(gzip ? gzipSync(body) : body);
});`,
        },
      },
      {
        heading: "Budgets that mean something",
        paragraphs: [
          "[TODO: why accessibility, best practices and SEO must be 100 — those audits are deterministic, anything less is a defect — while performance gets a floor of 90 with room for a slower CI runner.]",
          "[TODO: the rule in the comment — raise a budget as the site improves, never lower one to get a red build through. And the scores are published on the colophon page.]",
        ],
        code: {
          language: "typescript",
          source: `const BUDGETS: LighthouseScores = {
  performance: 90,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
};`,
        },
      },
      {
        heading: "What I check first now",
        paragraphs: [
          "[TODO: the takeaway — before trusting a performance number, make the test stand behave like production: compression, base path, 404 handling, the same build.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 2. Sources: ADR 0010, ADR 0015.
    slug: "contact-form-that-never-lies",
    title: "A Contact Form That Never Says “Sent” When It Wasn't",
    date: "2026-10-31",
    tags: ["Angular", "UX", "Testing"],
    preview:
      "[TODO: one or two sentences — I removed the form once because a fake one is worse than none, then brought it back on one condition.]",
    readingTime: 6,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. A static site, no backend, and a form that would have to talk to someone else's server.]",
        ],
      },
      {
        heading: "Why I removed the form the first time",
        paragraphs: [
          "[TODO: what the first form did — a success screen with no confirmed send — and why that is worse than a mailto link (ADR 0010).]",
          "[TODO: the e2e test that then guarded the removal: a real mailto link, and no form in the DOM.]",
        ],
      },
      {
        heading: "The one condition for bringing it back",
        paragraphs: [
          "[TODO: the rule of ADR 0015 — “Message sent” may only appear after the service confirms the send.]",
          "[TODO: why Web3Forms, and why its access key in the bundle is not a secret: it only allows posting to its owner's inbox.]",
        ],
      },
      {
        heading: "Trust the body, not just the status",
        paragraphs: [
          "[TODO: `ok` and `success: true` together; a 15-second `AbortSignal.timeout` combined with the component's own abort signal; a plain `fetch` instead of `HttpClient` for the app's only request.]",
        ],
        code: {
          language: "typescript",
          source: `const payload = (await response.json().catch(() => ({}))) as Web3FormsResponse;

if (!response.ok || payload.success !== true) {
  throw new Error(payload.message ?? \`Web3Forms responded with \${response.status}.\`);
}`,
        },
      },
      {
        heading: "Testing the path nobody demos",
        paragraphs: [
          "[TODO: the failure path is the one that matters, so it has its own e2e test with an intercepted request. The success test checks the payload that was actually sent.]",
        ],
        code: {
          language: "typescript",
          source: `test("contact form admits failure instead of claiming a message was sent", async ({ page }) => {
  await page.route("https://api.web3forms.com/**", async (route) => {
    await route.fulfill({ status: 500, json: { success: false, message: "Server error" } });
  });
  // … fill in the form and send it …
  await expect(page.getByText("The message could not be sent")).toBeVisible();
  await expect(page.getByText("Message sent.")).toHaveCount(0);
});`,
        },
      },
      {
        heading: "Spam, and the fallbacks",
        paragraphs: [
          "[TODO: a hidden honeypot field instead of a captcha; mailto, phone, Telegram and LinkedIn stay below the form.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 3. Sources: ADR 0002, 0006, 0012.
    slug: "zoneless-angular-in-practice",
    title: "Zoneless Angular: What Actually Changes in Your Code",
    date: "2026-10-31",
    tags: ["Angular", "Architecture"],
    preview:
      "[TODO: one or two sentences — removing zone.js takes one line; what then breaks takes longer to explain.]",
    readingTime: 7,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. `provideZonelessChangeDetection()`, zone.js gone from the bundle, and everything still seems to work.]",
        ],
      },
      {
        heading: "The field that renders by accident",
        paragraphs: [
          "[TODO: a plain field only reaches the screen when something else triggers change detection. It works in development, then fails on the one path where nothing else happens.]",
          "[TODO: the rule that follows — anything a template shows is a signal.]",
        ],
      },
      {
        heading: "High-frequency events stay outside change detection",
        paragraphs: [
          "[TODO: `@HostListener('mousemove')` schedules a cycle per event. Register the listener by hand after the first render and coalesce the work into one frame.]",
        ],
        code: {
          language: "typescript",
          source: `private trackCursor(): void {
  const onMouseMove = (event: MouseEvent) => {
    if (this.pendingCursorFrame) {
      cancelAnimationFrame(this.pendingCursorFrame);
    }
    this.pendingCursorFrame = requestAnimationFrame(() => {
      this.pendingCursorFrame = 0;
      const style = document.documentElement.style;
      style.setProperty("--cursor-x", \`\${event.clientX}px\`);
      style.setProperty("--cursor-y", \`\${event.clientY}px\`);
    });
  };

  document.addEventListener("mousemove", onMouseMove, { passive: true });
  this.destroyRef.onDestroy(() => document.removeEventListener("mousemove", onMouseMove));
}`,
        },
      },
      {
        heading: "Gestures without the framework",
        paragraphs: [
          "[TODO: the experience section's wheel and swipe logic — thresholds, a cooldown, an exit budget at the edges — lives in plain classes that never see an event or the DOM, so it is unit-tested without TestBed.]",
        ],
        code: {
          language: "typescript",
          source: `/** Movement needed before a wheel gesture switches the role. */
const WHEEL_THRESHOLD_PX = 84;
/** Quiet period after a switch, so one flick does not skip two roles. */
const WHEEL_COOLDOWN_MS = 360;
/** Extra budget spent at the first/last role before the page may scroll on. */
const EDGE_EXIT_THRESHOLD_PX = 170;

export class WheelNavigator {
  decide(deltaX: number, deltaY: number, index: number, count: number, now: number): WheelDecision {
    // "ignore" | "block" | "release" | "previous" | "next"
  }
}`,
        },
      },
      {
        heading: "What you get back",
        paragraphs: [
          "[TODO: a smaller bundle, no monkey-patched APIs, and change detection you can reason about: it runs when a signal changes, and only then.]",
          "[TODO: a closing line — maybe pointing at the live signal graph on the colophon page.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 4. Sources: ADR 0003, 0011, 0013, 0019.
    slug: "prerendering-angular-for-github-pages",
    title: "Prerendering an Angular Site for GitHub Pages",
    date: "2026-10-31",
    tags: ["Angular", "SEO"],
    preview:
      "[TODO: one or two sentences — link previews showed the home page for every post, because GitHub Pages has no server to answer /blog/:slug.]",
    readingTime: 7,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. Sharing a post on LinkedIn or Telegram and getting the home page's title and image.]",
        ],
      },
      {
        heading: "Why a static host breaks deep links",
        paragraphs: [
          "[TODO: Pages serves files. /blog/some-post has no file, so it got 404.html, a copy of the client shell, and crawlers that run no JavaScript read the shell's meta tags.]",
        ],
      },
      {
        heading: "One index.html per route",
        paragraphs: [
          '[TODO: `outputMode: "static"` boots the app in Node once per route at build time. The slugs come from the same services the pages use, so a new post needs no extra step.]',
        ],
        code: {
          language: "typescript",
          source: `{
  path: "blog/:slug",
  renderMode: RenderMode.Prerender,
  getPrerenderParams: async () =>
    inject(BlogService)
      .getAll()
      .map(({ slug }) => ({ slug })),
},`,
        },
      },
      {
        heading: "The 404 page must be the empty shell",
        paragraphs: [
          "[TODO: index.html is now the prerendered home page. Copying it to 404.html would hydrate home markup on an unknown URL; the build's index.csr.html is the right fallback.]",
        ],
        code: {
          language: "shell",
          source: "cp dist/dimacodehub/browser/index.csr.html dist/dimacodehub/browser/404.html",
        },
      },
      {
        heading: "Base href and relative assets",
        paragraphs: [
          "[TODO: the site lives under /dimacodehub/, so every asset link is relative — an absolute path ignores <base href> and 404s.]",
        ],
      },
      {
        heading: "Hydration under a strict CSP",
        paragraphs: [
          "[TODO: incremental hydration inlines generated event-replay scripts, which a `script-src 'self'` policy can't hash. So it stays off, and the build output is checked for bare scripts.]",
        ],
      },
      {
        heading: "Meta tags that clean up after themselves",
        paragraphs: [
          "[TODO: `syncPageMeta()` sets a page's description and OG tags and puts the site-wide ones back when the page is destroyed, so / doesn't keep describing the last post.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 5. Source: ADR 0025.
    slug: "scroll-driven-animations-overflow-trap",
    title: "Scroll-Driven Animations, and the Overflow Trap",
    date: "2026-10-31",
    tags: ["CSS", "Frontend", "UX"],
    preview:
      "[TODO: one or two sentences — animation-timeline: view() did nothing at all, and nothing said why.]",
    readingTime: 5,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. Entrances tied to the scroll position, no JavaScript, and on the home page — nothing happened.]",
        ],
      },
      {
        heading: "view() follows the nearest scroll container",
        paragraphs: [
          "[TODO: the home sections clip their overflow, and overflow: hidden makes an element a scroll container. view() inside a section watched the section, which never scrolls.]",
        ],
      },
      {
        heading: "A named timeline per slide",
        paragraphs: [
          "[TODO: each .slide-section publishes `view-timeline-name: --slide`; its title, copy and cards animate along it, staggered by order.]",
        ],
        code: {
          language: "scss",
          source: `.slide-section {
  view-timeline-name: --slide;
}

@mixin slide-reveal($order: 0) {
  $start: math.min(10% + $order * $-step, 70%);
  @include -reveal(--slide, entry $start, entry math.min($start + 50%, 100%));
}`,
        },
      },
      {
        heading: "Nothing above the fold waits",
        paragraphs: [
          "[TODO: content already in view at load is at the end of its range, so it is simply there — no LCP waiting on an animation. Link to the Lighthouse post.]",
        ],
      },
      {
        heading: "Reduced motion and older browsers",
        paragraphs: [
          "[TODO: both conditions sit in one mixin; without support or with reduced motion, there is no animation and the content is visible.]",
          "[TODO: a closing line.]",
        ],
        code: {
          language: "scss",
          source: `@mixin -reveal($timeline, $start, $end) {
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      animation: reveal-rise linear both;
      animation-timeline: $timeline;
      animation-range: $start $end;
    }
  }
}`,
        },
      },
    ],
  },
  {
    // docs/blog-plan.md, post 6. Sources: ADR 0020, 0007.
    slug: "dark-theme-without-theme-checks",
    title: "A Dark Theme Where Components Don't Know Which Theme Is On",
    date: "2026-10-31",
    tags: ["CSS", "Architecture"],
    preview:
      "[TODO: one or two sentences — every translucent shade written before the dark theme followed it without being touched.]",
    readingTime: 5,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. A site built light-only, with dozens of translucent borders and fills, and a dark theme to add.]",
        ],
      },
      {
        heading: "One set of roles, two sets of values",
        paragraphs: [
          "[TODO: ink, wine, surface, muted, paper… as --brand-* custom properties, written once per theme. Components use the roles and never ask which theme is on.]",
        ],
      },
      {
        heading: "Mix the custom property, not the colour",
        paragraphs: [
          "[TODO: the SCSS helpers compile to color-mix over var(), so a translucent shade is computed by the browser from whatever the theme says.]",
        ],
        code: {
          language: "scss",
          source: `@function -mix($property, $alpha) {
  @return color-mix(in srgb, var($property) math.percentage($alpha), transparent);
}

// Foreground tints: borders, hover fills, focus rings.
@function ink($alpha) {
  @return -mix(--brand-ink, $alpha);
}`,
        },
      },
      {
        heading: "No flash on load",
        paragraphs: [
          "[TODO: the system decides until the visitor does. A tiny inline script applies a saved choice before the first paint; the CSP allows it by its hash, and a unit test keeps the hash in step with the script.]",
        ],
        code: {
          language: "html",
          source: `<script id="theme-init">
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch (e) {}
</script>`,
        },
      },
      {
        heading: "The deliberate exception",
        paragraphs: [
          "[TODO: the hero sits on a photo in both themes, so it keeps its literal whites.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 7. Source: ADR 0023.
    slug: "syntax-highlighter-without-innerhtml",
    title: "A Syntax Highlighter in About 100 Lines, Without innerHTML",
    date: "2026-10-31",
    tags: ["Angular", "Frontend"],
    preview:
      "[TODO: one or two sentences — why the code in these posts is coloured by a tokenizer small enough to read in one sitting.]",
    readingTime: 6,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. The code blocks on this page are coloured by the code shown below.]",
        ],
      },
      {
        heading: "Why not Prism or Shiki",
        paragraphs: [
          "[TODO: bundle size, and both hand back HTML — which means innerHTML, sanitizing, and a strict CSP to argue with.]",
        ],
      },
      {
        heading: "Sticky regular expressions",
        paragraphs: [
          "[TODO: an ordered list of rules per language, each a regex with the y flag, tried at the current position. The first that matches wins; nothing matches → one plain character.]",
        ],
        code: {
          language: "typescript",
          source: `export function highlight(source: string, language: CodeLanguage): Token[] {
  const rules = GRAMMARS[language];
  const tokens: Token[] = [];
  let plain = "";
  let index = 0;

  while (index < source.length) {
    const match = matchAt(rules, source, index);
    if (!match) {
      plain += source[index];
      index += 1;
      continue;
    }
    const [kind, text] = match;
    // … flush plain text, push { text, kind } …
    index += text.length;
  }
  return tokens;
}`,
        },
      },
      {
        heading: "Tokens, not markup",
        paragraphs: [
          "[TODO: the template renders each token as a <span> through interpolation, so source is never parsed as HTML. The colours are theme tokens (--code-*).]",
        ],
      },
      {
        heading: "It colours, it doesn't parse",
        paragraphs: [
          "[TODO: a misread construct shows in the wrong colour and is never broken. The invariant test: joining the tokens gives back the source exactly.]",
        ],
      },
      {
        heading: "The table of contents, while we're here",
        paragraphs: [
          "[TODO: heading ids from the heading text, the list from three headings up, and the active line a third of the way down the viewport — including the last section at the bottom of the page.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 8. Source: ADR 0024.
    slug: "command-palette-native-dialog",
    title: "⌘K With a Native <dialog>",
    date: "2026-10-31",
    tags: ["Angular", "UX", "Accessibility"],
    preview: "[TODO: one or two sentences — a command palette with no focus-trap code of its own.]",
    readingTime: 6,
    draft: true,
    sections: [
      {
        paragraphs: ["[TODO: the hook. Press ⌘K (or Ctrl+K) on this site.]"],
      },
      {
        heading: "What showModal() gives you for free",
        paragraphs: [
          "[TODO: a focus trap, Esc, an inert page behind it, and focus returned to where it was — all from the browser.]",
        ],
      },
      {
        heading: "A combobox inside",
        paragraphs: [
          "[TODO: the input keeps focus and points at the highlighted option with aria-activedescendant; arrows move, Enter runs.]",
        ],
        code: {
          language: "html",
          source: `<input
  role="combobox"
  aria-label="Search pages, posts and actions"
  aria-autocomplete="list"
  aria-expanded="true"
  aria-controls="palette-results"
  [attr.aria-activedescendant]="activeId()"
/>
<ul id="palette-results" role="listbox" aria-label="Results">
  <li role="option" [attr.aria-selected]="i === activeIndex()">…</li>
</ul>`,
        },
      },
      {
        heading: "Ranking as a pure function",
        paragraphs: [
          "[TODO: commands are data; every word of the query must match; a label prefix ranks first, then a word prefix, then the rest in their original order. Tested without a DOM.]",
        ],
        code: {
          language: "typescript",
          source: `export function filterCommands(commands: readonly Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\\s+/).filter(Boolean);
  if (!words.length) {
    return [...commands];
  }

  const phrase = words.join(" ");
  return commands
    .map((command, index) => ({ command, index, rank: rank(command, words, phrase) }))
    .filter(({ rank }) => rank !== null)
    .sort((a, b) => a.rank! - b.rank! || a.index - b.index)
    .map(({ command }) => command);
}`,
        },
      },
      {
        heading: "Loaded when the page is idle",
        paragraphs: [
          "[TODO: @defer (on idle) keeps the palette out of the first paint; whether it is open lives in a tiny service in the main bundle, so the header button works before the chunk arrives.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 9. Sources: ADR 0009, 0016, 0017, the colophon page.
    slug: "documentation-that-fails-the-build",
    title: "Documentation That Fails the Build",
    date: "2026-10-31",
    tags: ["Testing", "Architecture"],
    preview:
      "[TODO: one or two sentences — the page describing how this site is built is held to the repository by unit tests.]",
    readingTime: 5,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. Docs that describe a codebase drift the day after they are written.]",
        ],
      },
      {
        heading: "A page that states facts, and tests that check them",
        paragraphs: [
          "[TODO: the colophon lists the ADRs, the CI steps and the coverage floor. Rename an ADR or a CI step and the unit tests fail until the page agrees.]",
        ],
        code: {
          language: "typescript",
          source: `it("names only steps the CI workflow really has, in its order", () => {
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
  const steps = [...workflow.matchAll(/- name: (.+)/g)].map(([, name]) => name);
  const positions = PIPELINE.map(({ step }) => steps.indexOf(step));

  expect(positions).not.toContain(-1);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});`,
        },
      },
      {
        heading: "Content validation as unit tests",
        paragraphs: [
          "[TODO: posts are data in code, so their rules are tests — unique slugs, parseable dates, no [TODO] left in a published post.]",
        ],
      },
      {
        heading: "A coverage floor, not a target",
        paragraphs: [
          "[TODO: set a little below the baseline, so it catches drops instead of inviting tests written for the number.]",
        ],
      },
      {
        heading: "The whole gate",
        paragraphs: [
          "[TODO: format, lint, type check, unit tests with coverage, e2e, Lighthouse — and only then a deploy.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    // docs/blog-plan.md, post 10. Source: ADR 0022.
    slug: "page-views-without-tracking-script",
    title: "Page Views Without a Tracking Script",
    date: "2026-10-31",
    tags: ["Frontend", "Privacy"],
    preview:
      "[TODO: one or two sentences — counting visits with one sendBeacon per page, no cookies and no third-party JavaScript.]",
    readingTime: 4,
    draft: true,
    sections: [
      {
        paragraphs: [
          "[TODO: the hook. Wanting to know whether anyone reads this, without a cookie banner.]",
        ],
      },
      {
        heading: "Why GoatCounter",
        paragraphs: [
          "[TODO: no cookies and no personal data, so no consent banner; free for personal sites. What else was considered (Plausible, Umami).]",
        ],
      },
      {
        heading: "Skipping count.js",
        paragraphs: [
          "[TODO: the script only builds a request from the path, title, referrer and screen. The app does the same on each navigation that changes the path, so a client-side route counts and a jump to a heading doesn't.]",
        ],
        code: {
          language: "typescript",
          source: `router.events
  .pipe(
    filter((event) => event instanceof NavigationEnd),
    takeUntilDestroyed(),
  )
  .subscribe((event) => {
    // A jump to a heading or a blog tag filter changes the URL, not the page.
    const path = event.urlAfterRedirects.split(/[?#]/)[0]!;
    if (path === lastPath) {
      return;
    }
    lastPath = path;
    window.navigator.sendBeacon(pageViewUrl({ path, title, referrer, screen }));
  });`,
        },
      },
      {
        heading: "Only production counts",
        paragraphs: [
          "[TODO: the prerender, the dev server, e2e runs and the Lighthouse audit send nothing — the beacon checks the host.]",
        ],
      },
      {
        heading: "One line in the CSP",
        paragraphs: [
          "[TODO: the policy gains one connect-src origin, and a test keeps it equal to the endpoint in the code.]",
          "[TODO: a closing line.]",
        ],
      },
    ],
  },
  {
    slug: "ai-frontend-engineering",
    title: "What AI Actually Changes About Frontend Engineering",
    date: "2026-04-22",
    tags: ["AI", "Frontend", "UX", "Architecture"],
    preview:
      "Writing code got cheap; knowing what good looks like didn't. What AI changes about how frontend gets built, what changes when AI is the feature — and what stays exactly the same.",
    readingTime: 11,
    sections: [
      {
        paragraphs: [
          "AI changes frontend work from two directions at once. It changes how we build: a working component is now a sentence away. And it changes what we build: chat, inline suggestions, semantic search and summaries are ordinary product features now, with their own engineering problems.",
          "I've been on both sides for over a year — writing code with AI every day, and integrating AI features into products. My conclusion is less dramatic than most of what's written about it. AI doesn't bring a new kind of engineering. It makes the old kind — clear standards, explicit state, honest error handling, accessible markup — impossible to skip. This post covers both directions, the first one first.",
        ],
      },
      {
        heading: "Writing code stopped being the bottleneck",
        paragraphs: [
          "Being a good frontend engineer used to mean, to a large degree, being fast and fluent at writing code: knowing the framework, remembering the APIs, building something from scratch without constantly looking things up. That fluency still matters, but it's no longer scarce. Describe a feature with enough context and you get a working implementation in minutes.",
          "What didn't get cheaper is everything around the code. Deciding what to build. Reading a 600-line diff and knowing whether it belongs in this codebase. Noticing the state nobody specified. The time I save typing now goes into reviewing, and a review is only as good as my understanding of the system it lands in.",
          "That's why I disagree with the idea that engineers no longer need to understand code because AI writes it. It's the other way round: you can't review what you don't understand, and you can't spot a bad architectural decision in an architecture you don't know. 'It runs' was never the bar — and the more code is generated, the less 'it runs' tells you.",
        ],
      },
      {
        heading: "Generated code defaults to the average",
        paragraphs: [
          "A model writes the most likely code for the request — roughly the average of everything it learned from. In frontend the average is not great. It reaches for a `div` with a click handler instead of a button, adds a new spinner instead of the one your design system already has, fetches data its own way instead of through your data layer, and copies a near-duplicate of a component that already exists two folders away.",
        ],
        code: {
          language: "html",
          source: `<!-- The likely output: looks fine, works with a mouse, invisible to a keyboard. -->
<div class="card" (click)="open(order)">{{ order.title }}</div>

<!-- What the codebase actually wants: a real control, focusable for free. -->
<article class="card">
  <h3><a class="card__link" [routerLink]="['/orders', order.id]">{{ order.title }}</a></h3>
</article>`,
        },
      },
      {
        heading: "The cost of code that is easy to write",
        paragraphs: [
          "The second effect is volume. When code is nearly free to produce, nobody hesitates to produce more of it — another component, another helper, another layer of abstraction that works but that nobody asked for. Each piece passes review on its own; together they make a codebase that is bigger, slower to read and harder to change. Generated code is also sometimes cleverer than the problem needs, which is its own kind of debt.",
          "So deleting code, merging duplicates and keeping the structure small becomes a bigger part of the job, not a smaller one. The fix for a model that defaults to the average is not a longer prompt every time. It's a codebase that makes the right choice the obvious one.",
        ],
      },
      {
        heading: "Define what good looks like before the code exists",
        paragraphs: [
          "Asking for a form is easy. Whether the form validates correctly, has loading and error states, is accessible, uses the existing input components and follows the same data-fetching pattern as the rest of the app — that's the actual work, and it's exactly what gets lost when the measure is how fast something was built.",
          "Those expectations should be written down before anyone starts, human or model. Not as a wiki page nobody opens, but in the repository, next to the code: architecture decision records, a short instructions file for coding agents that names the conventions, and feature specs that say which states and scenarios must exist. When someone adds a feature, they shouldn't have to guess how state is managed or how errors are shown — and neither should an agent. The same standards apply to both.",
          "This site works that way. The repository has written decisions for every non-obvious choice and an instructions file that names the conventions. One unit test fails when the page describing how the site is built stops matching the repository, so the docs can't quietly fall behind.",
        ],
      },
      {
        heading: "Guardrails beat instructions",
        paragraphs: [
          "Written standards help; enforced ones help more. Anything a machine can check should be checked by a machine: a lint rule for the clickable `div`, a type that makes an impossible state unrepresentable, an import rule that keeps shared code out of features. A model forgets a sentence in a document. It can't forget a failing build.",
          "This has a practical side for agents in particular. An agent is as good as its feedback loop. A repository where `lint`, `typecheck` and the tests each run with one command and give a clear error lets an agent find and fix its own mistakes. A repository where 'it works on my machine' is the test lets it ship them.",
        ],
      },
      {
        heading: "Tests are the spec that can't drift",
        paragraphs: [
          "The most valuable artefact in an AI-assisted codebase may be the one that describes behaviour rather than implementation. A behaviour test says what must stay true no matter who or what rewrites the code next. Once a bug is fixed, a test that pins it down means no later refactor — human or generated — can quietly bring it back.",
          "Here's one from this site. The contact form must never claim a message was sent unless the service confirmed it. That rule is not a comment; it's this:",
        ],
        code: {
          language: "typescript",
          source: `test("contact form admits failure instead of claiming a message was sent", async ({ page }) => {
  await page.route("https://api.web3forms.com/**", async (route) => {
    await route.fulfill({ status: 500, json: { success: false, message: "Server error" } });
  });

  await page.goto("/#contacts");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Message").fill("I would like to talk about an Angular rewrite.");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("The message could not be sent")).toBeVisible();
  await expect(page.getByText("Message sent.")).toHaveCount(0);
});`,
        },
      },
      {
        heading: "Generated tests need the same review",
        paragraphs: [
          "AI is genuinely good at writing tests: scaffolding, sample data, the tedious tenth variation of a case. But a test generated from the implementation tends to assert what the code does, not what it should do — a bug turns into an expectation. The scenarios still have to come from someone who knows what the feature is for; the model can write them out.",
          "Notice also what the test above uses to find things: labels, roles, the button's accessible name. That turns out to matter for the next point.",
        ],
      },
      {
        heading: "Your interface has a new kind of user",
        paragraphs: [
          "Agents now operate websites on people's behalf: they read the page, find the controls and fill in forms. Most of them navigate the same structure a screen reader does — roles, names, labels, headings. A button that is really a `div` is as invisible to an agent as it is to a keyboard user.",
          "So semantic, accessible markup now serves three audiences: people with assistive technology, your test suite, and software acting for users. It was always the right thing to do; it's now also the cheapest way to be usable by agents. The same goes for honest states — a form that shows a clear error is one an agent can recover from.",
          "I'm more sceptical about the other popular prediction: interfaces generated per user, rearranging themselves around each person's behaviour. A layout that moves breaks muscle memory, makes support instructions wrong and multiplies what must be tested and checked for accessibility. I'd rather give users settings they control than have the interface guess. Personalising content is old news; personalising the controls themselves has a higher bar to clear.",
        ],
      },
      {
        heading: "When AI is the feature: streaming changes loading states",
        paragraphs: [
          "Now the other direction — building AI into the product. Most model responses are streamed: the server sends tokens as they're produced, over one long-lived response. A 3-second blank wait followed by a wall of text feels broken; the same 3 seconds with text appearing as it's written feels fast. The UI is no longer rendering a response, it's rendering a document that keeps growing.",
          "The first surprise is transport. Server-Sent Events are the usual wire format, but the browser's `EventSource` only does GET, with no body and no custom headers. In practice you POST with `fetch` and read the event format off the response body yourself:",
        ],
        code: {
          language: "typescript",
          source: `export async function* streamAnswer(
  request: ChatRequest,
  signal: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new ChatHttpError(response.status, response.headers.get("Retry-After"));
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += value;
    // An event ends with a blank line; a chunk can end mid-event.
    const events = buffer.split("\\n\\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const data = event
        .split("\\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice("data: ".length))
        .join("\\n");
      if (data) yield data;
    }
  }
}`,
        },
      },
      {
        heading: "Rendering a document that is still being written",
        paragraphs: [
          "The `AbortSignal` powers the Stop button, and it's what you abort in `DestroyRef.onDestroy()` — otherwise a user who navigates away keeps paying for tokens nobody will read.",
          "Models answer in markdown, and half a markdown document is often invalid: an unclosed code fence turns the rest of the answer into one grey block until the closing backticks arrive. Close open fences before parsing each partial, and parse at most once per animation frame rather than on every token.",
          "And don't make the answer an `aria-live` region: a screen reader would try to announce every token. Keep the answer out of the live region and announce once, when it's done:",
        ],
        code: {
          language: "html",
          source: `<article class="answer">
  <app-markdown [source]="answerText()" />
</article>

<!-- Says "Answer ready" once, instead of reading every token aloud. -->
<p class="visually-hidden" aria-live="polite">{{ announcement() }}</p>`,
        },
      },
      {
        heading: "Error handling is more visible than ever",
        paragraphs: [
          "A REST call succeeds or fails. A streamed answer can fail before the first token, stop halfway, be stopped by the user, end in a refusal, or hit a rate limit after several requests that worked. A boolean `isLoading` plus an `error` string can't express that, so I model the answer as a discriminated union and let the template switch on it:",
        ],
        code: {
          language: "typescript",
          source: `type AnswerState =
  | { status: "idle" }
  | { status: "waiting" } // sent, no token yet
  | { status: "streaming"; text: string }
  | { status: "done"; text: string }
  | { status: "interrupted"; text: string; reason: "network" | "stopped" }
  | { status: "refused"; message: string }
  | { status: "rate-limited"; retryAfterSeconds: number | null };`,
        },
      },
      {
        heading: "What each failure should look like",
        paragraphs: [
          "An interrupted answer keeps the text it already has and offers Retry next to it — throwing away 400 words because the last 20 didn't arrive is the most common mistake I see. A refusal is shown as what it is, never as an empty state. A rate limit becomes a sentence with a time in it, read from `Retry-After`, not a raw 429.",
          "One subtle case: a stream that simply ends. Without an explicit final event, a dropped connection and a finished answer look identical to the client. Agree on a terminal event with the backend and treat a stream that closes without it as interrupted.",
        ],
      },
      {
        heading: "Perceived performance matters more than actual performance",
        paragraphs: [
          "Time to the first token is often a second or more, even with fast providers. The frontend can't engineer that away; it can only design around it. My rule: the interface reacts in the same frame as the click. The user's message appears in the thread, the input clears, Send becomes Stop, and a 'thinking' state takes the answer's place — none of it waits for the network.",
          "The old response-time limits hold up well: about 0.1 s feels instant, about 1 s keeps the flow of thought, past 10 s attention leaves. Make the acknowledgement land in the first band even when the answer can only land in the second. And measure time to first token, not total time — that's where your own code (auth round-trips, context retrieval, a cold function) shows up.",
        ],
      },
      {
        heading: "Where does AI logic actually belong?",
        paragraphs: [
          "Should prompt construction live in the frontend or the backend? Almost always the backend. The provider's API key can't ship to the browser, so something server-side makes the call anyway. More importantly, prompts are product logic: in client code they're readable by every user, editable in DevTools, and every wording change waits for a frontend release. So the browser sends intent and references, not a prompt:",
        ],
        code: {
          language: "typescript",
          source: `// What the frontend sends. The server turns it into a prompt.
interface ChatRequest {
  readonly conversationId: string;
  readonly message: string;
  readonly context: {
    readonly productId?: string;
    readonly locale: string;
  };
}`,
        },
      },
      {
        heading: "A boundary that survives model changes",
        paragraphs: [
          "With that contract, the frontend collects input, renders the stream and handles every state in `AnswerState`. The backend owns the model: which one, which prompt, what context, what limits. Providers and prompts change without a UI deploy — and the UI can be built against a fake stream before the model work is done.",
          "That fake is worth having permanently. A test server that streams canned events with delays and a mid-stream cut exercises every branch of the state machine in e2e tests, deterministically, without paying for a single token.",
        ],
      },
      {
        heading: "What hasn't changed",
        paragraphs: [
          "Good component boundaries, clean state, explicit error states, accessible markup — all of it matters as much as before. If anything the bar is higher: a sloppy loading state in a form is annoying, the same sloppiness in a chat feels broken, and generated code repeats a sloppy pattern as fast as a good one.",
          "What changes is where experience shows. A good engineer fixes the bug. An experienced one asks why the bug was possible and closes that door — a shared component, a lint rule, a test, a written decision. That work is less visible than a new feature, and it's what makes every feature after it cheaper. With AI multiplying how much code gets written, it's the work that matters most.",
          "I'd be careful with measuring AI by output. Twice the code with twice the bugs isn't progress; sometimes the most valuable result is less code, a better spec, or a decision not to build something. AI can write the code. Someone still has to understand what's being built, why, and whether it was built well — and own the outcome.",
        ],
      },
    ],
  },
  {
    slug: "angular-architecture-patterns",
    title: "Angular Architecture Patterns I Use in Production",
    date: "2024-03-15",
    tags: ["Angular", "Architecture", "NgRx"],
    preview:
      "Good architecture is invisible — it's what lets a team move fast without breaking things. The patterns I've kept after years of Angular products that outgrew their plans, why each one earns its place, and how I make the tooling enforce them.",
    readingTime: 10,
    sections: [
      {
        paragraphs: [
          "I've spent most of my career on Angular products that grew beyond what anyone planned for: a CRM used across Europe, a healthcare platform with 50K+ active users, products where the team doubled and the feature scope tripled in two years.",
          "The decisions you make in the first few months tend to live with you for years. Angular gives you the tools, but it doesn't tell you how to arrange them at scale — and most of the pain I've seen in large codebases wasn't caused by a missing feature. It was caused by nobody being able to say who owns a piece of state, which component is allowed to call the API, or which folder a new file belongs in.",
          "So every pattern below serves one idea: make ownership obvious. Each piece of state, logic and UI should have one owner you can find without asking. Where I can, I also show how to make tooling enforce the pattern, because a rule that lives only in a wiki is a suggestion.",
        ],
      },
      {
        heading: "Keep your components dumb",
        paragraphs: [
          "The highest-leverage rule in any Angular codebase: most components should only take inputs, emit outputs and render. No HTTP calls, no business rules, as little derived state as possible. A handful of page-level components connect that tree to services or the store; everything below them is presentational.",
        ],
        code: {
          language: "typescript",
          source: `// Presentational: no injected services, nothing to mock in a test.
@Component({
  selector: "app-order-row",
  templateUrl: "./order-row.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderRowComponent {
  readonly order = input.required<OrderView>();
  readonly cancel = output<string>();
}

// The page is the one place that knows where data comes from.
@Component({
  selector: "app-orders-page",
  template: \`
    @for (order of orders(); track order.id) {
      <app-order-row [order]="order" (cancel)="onCancel($event)" />
    } @empty {
      <p>No orders yet.</p>
    }
  \`,
  imports: [OrderRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent {
  private readonly facade = inject(OrdersFacade);
  readonly orders = this.facade.orders;

  onCancel(id: string): void {
    this.facade.cancel(id);
  }
}`,
        },
      },
      {
        heading: "Why dumb components pay off",
        paragraphs: [
          "Testability is the obvious payoff: a component with no injected services is tested by setting inputs and reading the DOM, and it renders in Storybook in every state without a single mock. A component with three services and logic spread across lifecycle hooks needs a page of setup before the first assertion.",
          "The less obvious payoff is change. When a presentational component takes an `OrderView` — a shape made for display — rather than the raw API model, a backend change touches one mapping instead of twenty templates. And a reviewer can tell from the imports alone whether a component is allowed to talk to the outside world.",
          "Where I don't apply it: a component that is used once and has no logic worth isolating — a settings toggle doesn't need a container and a presenter. Splitting everything into tiny components so the architecture looks modular is its own kind of mess; the goal is that logic has a home, not that the component count goes up.",
        ],
      },
      {
        heading: "Organize by feature, not by file type",
        paragraphs: [
          "Folders named `components/`, `services/` and `models/` at the top of the app answer a question nobody asks. The question people ask is 'where is the orders code?'. So the top level is `features/` — one folder per product area holding its pages, components, state and API client — plus `shared/` for code that is genuinely generic (the UI kit, formatting utilities) and `core/` for things that exist once (auth, HTTP interceptors, the app shell).",
          "Each feature gets a public face: an `index.ts` that exports what other features may use. Everything else is private. Deleting or extracting a feature then means one folder and one list of exports, not a hunt across the app.",
        ],
        code: {
          language: "typescript",
          source: `// features/orders/index.ts — the only file other features may import.
export { OrdersPageComponent } from "./orders-page.component";
export { OrdersFacade } from "./orders.facade";
export type { OrderSummary } from "./order.model";

// order-row, the store slice, the API client: private to the feature.`,
        },
      },
      {
        heading: "Make the boundaries a lint error",
        paragraphs: [
          "The most common way this structure decays is `shared/` turning into the place where everything goes: a 'shared' component that knows about orders, a utility that imports a feature's model. After a year, nobody knows who owns what. Two rules prevent it — features are imported only through their `index.ts`, and shared code never imports a feature — and ESLint enforces both with a built-in rule:",
        ],
        code: {
          language: "typescript",
          source: `// eslint.config.js
{
  files: ["src/app/**/*.ts"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{ group: ["@app/features/*/*"], message: "Import a feature through its index.ts." }],
    }],
  },
},
{
  // Replaces the rule above for shared/; this pattern also covers deep imports.
  files: ["src/app/shared/**/*.ts"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{ group: ["@app/features/*"], message: "shared/ must not depend on a feature." }],
    }],
  },
},`,
        },
      },
      {
        heading: "State management is about boundaries",
        paragraphs: [
          "NgRx has a reputation for verbosity, and it earns it. But the verbosity does real work: it forces explicit decisions about what state exists, who owns it and how it changes.",
          "The mistake most teams make is putting everything in the store. Local UI state — is this dropdown open, which tab is selected — belongs in the component, as a signal. Server data that several features share belongs in the store. My rule fits in one sentence: if two distinct features need the same data, it goes in the store; if one component needs it, it stays local. I go through that rule, and what to use instead of NgRx, in a separate post on state management.",
        ],
      },
      {
        heading: "Derive, don't synchronize",
        paragraphs: [
          "Within whatever owns the state, the rule I lean on most is: if a value can be calculated from existing state, calculate it — don't store a second copy and keep it in step. Every stored copy is a second source of truth, and sooner or later one code path updates the first and forgets the second.",
          "Signals make the wrong version easy to spot. If you find yourself writing an `effect()` that sets another signal — so easy to get wrong that Angular makes you opt in with `allowSignalWrites` — you almost certainly wanted `computed()`:",
        ],
        code: {
          language: "typescript",
          source: `// Two sources of truth, kept in step by hand.
readonly items = signal<readonly CartItem[]>([]);
readonly total = signal(0);
constructor() {
  effect(() => this.total.set(sum(this.items())), { allowSignalWrites: true });
}

// One source of truth: the total can't disagree with the items.
readonly items = signal<readonly CartItem[]>([]);
readonly total = computed(() => sum(this.items()));`,
        },
      },
      {
        heading: "What effect() is actually for",
        paragraphs: [
          "Filtered lists, totals, display labels, whether a button is enabled, what a user is allowed to see — all of these are `computed()`. A `computed()` reading a signal `input()` replaces most of what `ngOnChanges` used to do, without the bookkeeping.",
          "`effect()` is for leaving the signal world: writing to `localStorage`, calling a third-party widget's imperative API, logging. If an effect's only job is to update other state, the relationship should have been declared, not scripted.",
        ],
      },
      {
        heading: "Signals for state, RxJS for streams",
        paragraphs: [
          "'Signals or RxJS?' is the wrong question; they're good at different things. A signal holds a value that exists right now — the query in a search box, the selected tab. An Observable describes things happening over time — keystrokes that should be debounced, requests that should cancel each other. Search needs both, and Angular's interop functions let each do its part:",
        ],
        code: {
          language: "typescript",
          source: `export class ProductSearchComponent {
  private readonly api = inject(ProductsApi);

  /** State: what the user typed. Bound to the input. */
  readonly query = signal("");

  /** A stream in the middle, state again at the end. */
  readonly results = toSignal(
    toObservable(this.query).pipe(
      map((query) => query.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>
        this.api.search(query).pipe(
          map((products) => ({ products, failed: false })),
          catchError(() => of({ products: [] as Product[], failed: true })),
        ),
      ),
    ),
    { initialValue: { products: [] as Product[], failed: false } },
  );
}`,
        },
      },
      {
        heading: "Where each tool stops",
        paragraphs: [
          "Debouncing, cancelling the previous request, retrying — that's RxJS's home ground, and rewriting it with signals and timers produces worse code, not more modern code. Holding the current value and deriving from it is where signals win: no subscriptions, no `async` pipe, no `BehaviorSubject` used as a variable.",
          "The boundary I aim for: signals at the edges a template touches, RxJS inside for anything with time in it, `toSignal` and `toObservable` where they meet. The template never sees an Observable; the service never hand-rolls a debounce.",
        ],
      },
      {
        heading: "A facade in front of the state",
        paragraphs: [
          "Pages shouldn't need to know how a feature's state is implemented. A facade is a small service per feature that exposes signals to read and methods to call, and hides whether there's NgRx, a signal service or three coordinating services behind it:",
        ],
        code: {
          language: "typescript",
          source: `@Injectable({ providedIn: "root" })
export class CartFacade {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(cartFeature.selectItems);
  readonly total = this.store.selectSignal(selectCartTotal);
  readonly canCheckout = computed(() => this.items().length > 0);

  add(product: Product): void {
    this.store.dispatch(CartActions.itemAdded({ product }));
  }

  applyDiscount(code: string): void {
    this.store.dispatch(CartActions.discountRequested({ code }));
  }
}`,
        },
      },
      {
        heading: "When a facade earns its place",
        paragraphs: [
          "The payoff I value most isn't the tidier constructor — it's the seam. Behind a facade you can move a feature from NgRx to a signal service, or the other way, without touching a single component. On a large codebase that's the difference between a migration you can do one feature at a time and one you never start.",
          "Two ways to get it wrong. A facade that only forwards calls one-to-one adds a file and nothing else; skip it until there's something to coordinate or hide. And a facade shared by several features becomes a god object; one facade per feature, exported from its `index.ts`, keeps ownership where it was.",
        ],
      },
      {
        heading: "Configuration through injection tokens",
        paragraphs: [
          "Importing `environment.ts` straight into a service fixes the value at build time and makes the service awkward to test. An `InjectionToken` turns configuration into a dependency like any other — provided once, overridden per test or per deployment:",
        ],
        code: {
          language: "typescript",
          source: `export interface AppConfig {
  readonly apiUrl: string;
  readonly features: { readonly newCheckout: boolean };
}

export const APP_CONFIG = new InjectionToken<AppConfig>("APP_CONFIG");

// app.config.ts
{ provide: APP_CONFIG, useValue: { apiUrl: environment.apiUrl, features: { newCheckout: false } } }

// any consumer
private readonly config = inject(APP_CONFIG);

// a test
TestBed.configureTestingModule({
  providers: [{ provide: APP_CONFIG, useValue: { apiUrl: "/test", features: { newCheckout: true } } }],
});`,
        },
      },
      {
        heading: "Feature modules vs standalone components",
        paragraphs: [
          "Since Angular 14 and the push toward standalone, I've stopped writing feature modules for new code. A standalone component lists its own dependencies, so the question changes from 'which module does this belong to?' to 'what does this component actually need?' — and the answer is visible right where it's used.",
          "The bigger win isn't the syntax, it's lazy loading. A route can load a single component without a module created just to hold it, and a feature can expose its routes as a plain array:",
        ],
        code: {
          language: "typescript",
          source: `export const routes: Routes = [
  {
    path: "orders",
    loadComponent: () => import("./features/orders").then((m) => m.OrdersPageComponent),
  },
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },
];`,
        },
      },
      {
        heading: "Lazy loading inside a page with @defer",
        paragraphs: [
          "Routes split the app by URL; `@defer` splits a page by priority. On a product page the user needs the product now; reviews and recommendations can arrive when they scroll near them or when the browser is idle. The component and everything it imports move into their own chunk:",
        ],
        code: {
          language: "html",
          source: `<app-product-details [product]="product()" />

@defer (on viewport) {
  <app-reviews [productId]="product().id" />
} @placeholder {
  <div class="reviews-placeholder"></div>
}

@defer (on idle) {
  <app-recommendations [productId]="product().id" />
}`,
        },
      },
      {
        heading: "Deferring without hurting the page",
        paragraphs: [
          "Two details decide whether `@defer` helps or hurts. The placeholder should reserve roughly the height of what replaces it — otherwise the content below jumps when the chunk lands, and you've traded a bundle-size win for layout shift. And `on viewport` watches the placeholder itself, so the placeholder needs a single root element.",
          "The rule for choosing what to defer is about the user, not the bundle: is it needed for the first useful screen? Is it below the fold? Can the user do what they came for without it? Deferring something people need immediately just moves the wait to a worse moment.",
        ],
      },
      {
        heading: "Migrating an NgModule codebase",
        paragraphs: [
          "For an existing NgModule codebase I don't recommend a big-bang migration. Angular mixes both styles happily: a standalone component can be imported into an NgModule, and a module into a standalone component. Start at the leaves — shared presentational components — and work inward; the CLI's standalone and control-flow schematics handle most of the mechanical part.",
          "Convert routes last. By the time the components they load are standalone, switching a route from `loadChildren` with a module to `loadComponent` is a two-line change. And modernise where it solves a problem: a stable, well-tested area written the old way can stay that way until there's a reason to open it.",
        ],
      },
      {
        heading: "What I would do differently",
        paragraphs: [
          "If I were starting a large Angular project today, I'd invest upfront in three things. A written state policy — one page in the repository that says what goes in the store, what stays local and what is derived. Boundaries the linter enforces from the first commit, because adding them later means first fixing every violation. And end-to-end tests for every critical user flow before the first major release.",
          "The E2E tests especially. We added Playwright to a mature product, and the confidence it gave the team to refactor showed up in velocity almost immediately. Don't wait until you're afraid to deploy.",
          "None of these patterns is the point on its own. Before I call a feature done, I ask a few questions: who owns this state, and could it be derived instead? Is this a value or a stream? Does this component need to exist on first render? Could the next developer find all of this without asking me? If the answers are obvious, the architecture is doing its job.",
        ],
      },
    ],
  },
  {
    slug: "state-management-production",
    title: "State Management Patterns I Actually Use",
    date: "2024-02-08",
    tags: ["Angular", "NgRx", "State Management"],
    preview:
      "Before picking a library, ask what kind of state it is and who owns the truth. Server cache, URL, local UI and shared client state each have a different home — and the global store ends up much smaller than you'd think.",
    readingTime: 9,
    sections: [
      {
        paragraphs: [
          "State management is a topic where the gap between theory and practice is enormous. You can read all of the Redux documentation and still build a tangled mess once the app passes a certain size.",
          "For years the default answer in Angular was 'add NgRx', and projects grew hundreds of files of actions, reducers and effects to show a list and open a dialog. I've built NgRx frontends in production, I still use NgRx, and I think the default was wrong. Not because NgRx is bad, but because it answers the second question before anyone asked the first: what kind of state is this, and who owns the truth?",
          "This is how I answer that question now: the categories I sort state into, where each one lives, and the NgRx patterns I keep for the state that genuinely needs a store.",
        ],
      },
      {
        heading: "Four kinds of state, four owners",
        paragraphs: [
          "Server state is data the backend owns: users, orders, products. Whatever you hold in the browser is a copy, and the real problems are cache problems — is it stale, who else is loading it, what to refetch after a change.",
          "URL state is what a link should reproduce: the current filter, sort order, page, selected tab. The address bar owns it, whether you like it or not — Back, reload and 'send this link to a colleague' all read from there.",
          "Local UI state belongs to one component: is the dropdown open, which accordion panel is expanded, what's typed in a field that hasn't been submitted. Shared client state is what's left: data the client itself owns and several unrelated parts of the app need — the session, a cart, user preferences, a wizard that spans routes.",
          "Most 'state management' pain I've seen comes from storing one kind in another kind's home: server data hand-copied into a store and going stale, filters in a service so the link doesn't reproduce them, a tooltip's visibility in the global store.",
        ],
      },
      {
        heading: "Server state is a cache, not state",
        paragraphs: [
          "Most of what ends up in a typical global store is a copy of the database, with `loadUsers`, `loadUsersSuccess` and `loadUsersFailure` written by hand for every entity. That's not modelling the app — it's reimplementing a cache badly. The hard parts of a cache are deduplication, staleness, background refresh and invalidation after a mutation, and hand-written reducers rarely do any of them.",
          "The direction I find most promising is a query library. TanStack Query has an Angular adapter — still experimental as I write this, so I'd introduce it in a corner of the app first — and it turns a request into signals for data, status and error, with caching handled by keys:",
        ],
        code: {
          language: "typescript",
          source: `export class ProductsPageComponent {
  private readonly api = inject(ProductsApi);

  readonly products = injectQuery(() => ({
    queryKey: ["products"],
    queryFn: () => lastValueFrom(this.api.list()),
    staleTime: 60_000, // reuse the cached list for a minute
  }));
}

// After a mutation, mark the cache stale; every screen showing products refetches.
queryClient.invalidateQueries({ queryKey: ["products"] });`,
        },
      },
      {
        heading: "If you keep server data in a store",
        paragraphs: [
          "A library isn't required; the mindset is. If server data lives in NgRx or a service, treat it as a cache explicitly: store when it was loaded, decide how long it's fresh, and after every mutation decide what becomes stale. A list that never refetches after an edit elsewhere is the classic bug of server data treated as client state.",
          "And keep the request status next to the data it describes — per entity or per query, not one global `loading` flag that two screens fight over.",
        ],
      },
      {
        heading: "The URL is state too",
        paragraphs: [
          "If a user sets up a filter, copies the link and sends it to a colleague, the colleague should see the same list. If they see an empty filter, the state lives in the wrong place. Filters, sort order, pagination and the active tab belong in the URL, and Angular's router already handles Back, Forward, reload and deep links for them.",
          "With `withComponentInputBinding()` a query parameter arrives as a component input, with no `ActivatedRoute` subscription:",
        ],
        code: {
          language: "typescript",
          source: `// app.config.ts: provideRouter(routes, withComponentInputBinding())

export class CatalogPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** /catalog?q=lamp lands here. An absent parameter arrives as undefined. */
  readonly q = input<string>();
  readonly query = computed(() => this.q() ?? "");

  search(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value.trim() || null }, // null removes the parameter
      queryParamsHandling: "merge",
      replaceUrl: true, // typing shouldn't fill the Back button's history
    });
  }
}`,
        },
      },
      {
        heading: "Details that make URL state pleasant",
        paragraphs: [
          "Three details I learned the hard way. A bound input whose parameter is absent receives `undefined`, overriding any default you gave it — hence the `computed()` with a fallback. Writing `null` removes a parameter, so a cleared filter leaves a clean URL instead of `?q=`. And choose `replaceUrl` deliberately: keystrokes should replace the history entry, while a discrete choice — picking a category, going to page 3 — deserves its own entry so Back undoes it.",
          "Not everything belongs in the URL. Scroll position, an open dropdown, a half-typed comment — if reproducing it from a link would surprise the person opening the link, it's local state.",
        ],
      },
      {
        heading: "Not everything belongs in the store",
        paragraphs: [
          "The most common NgRx mistake I see is the store used as a global variable dump. Every piece of data ends up there, whether or not anything else needs it.",
          "My test has two questions. Does this state cross a feature boundary? Does it need to survive navigation? If neither, it stays local. A form's validation state, a tooltip's visibility, an expanded card — those are component concerns, and putting them in the store adds an action, a reducer case and a selector for something `signal(false)` and an `update()` handle in two lines.",
          "A lean store pays off in places you don't expect: actions stay meaningful, the DevTools timeline stays readable, and a new developer can understand the app's shared state by reading one folder.",
        ],
      },
      {
        heading: "Shared state is smaller than you think",
        paragraphs: [
          "Take server data out (it's a cache), take filters out (they're in the URL), take UI flags out (they're local) — and what remains in most apps is short: the session, preferences, a cart, a multi-step flow. For that, I start with Angular's signals in a plain service:",
        ],
        code: {
          language: "typescript",
          source: `@Injectable({ providedIn: "root" })
export class CartStore {
  private readonly items = signal<readonly CartItem[]>([]);

  // The public API: read-only signals, like selectors.
  readonly lines = this.items.asReadonly();
  readonly count = computed(() => this.items().reduce((n, item) => n + item.quantity, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  // The only ways in: like actions and reducers in one place.
  add(product: Product): void {
    this.items.update((items) => {
      const existing = items.find((item) => item.productId === product.id);
      return existing
        ? items.map((item) => (item === existing ? { ...item, quantity: item.quantity + 1 } : item))
        : [...items, { productId: product.id, unitPrice: product.price, quantity: 1 }];
    });
  }

  remove(productId: string): void {
    this.items.update((items) => items.filter((item) => item.productId !== productId));
  }
}`,
        },
      },
      {
        heading: "What makes a signal service hold up",
        paragraphs: [
          "Three rules keep this shape honest. The writable signal is private, so the only way to change state is through named methods — the same guarantee actions give, without the files. Derived values are `computed()`, never stored: I've seen this pattern written with `total` kept as a field and recalculated inside `add()`, which works until someone adds `remove()` and forgets. And the public surface is read-only signals, so components can't `set()` their way around the methods.",
          "NgRx now has its own take on this, SignalStore — still in developer preview as I write — which gives the same idea a standard structure and plugins. Worth watching; the principles are the same either way.",
        ],
      },
      {
        heading: "Knowing when it has outgrown the service",
        paragraphs: [
          "A signal service covers a lot of ground. It also has limits worth knowing before they bite: two overlapping async loads can resolve out of order, because nothing plays the role of `switchMap`; there's no action log to replay a bug from; and when several features write to the same state, there's no single place that records who changed what and why.",
          "When I hit those — cancellation and ordering, a need for time-travel debugging, real cross-feature coordination with an audit trail — that's the point to introduce the NgRx store for that slice. The rest of this post is how I use it when I do.",
        ],
      },
      {
        heading: "Selectors as your API",
        paragraphs: [
          "Selectors are underused. Most teams write one selector per raw field and then compute everything in the component, which spreads the same derivation across several places, each slightly different.",
          "I treat selectors as the public API of a state slice. If a component needs 'active users, most recently logged in first', that's a selector — memoized, composable and testable as a pure function:",
        ],
        code: {
          language: "typescript",
          source: `export const usersFeature = createFeature({
  name: "users",
  reducer: usersReducer,
});

export const selectActiveUsersByLastLogin = createSelector(
  usersFeature.selectUsers,
  (users) =>
    users
      .filter((user) => user.active)
      .sort((a, b) => b.lastLoginAt - a.lastLoginAt),
);

// In the component: a signal, no async pipe, no subscription.
readonly users = this.store.selectSignal(selectActiveUsersByLastLogin);`,
        },
      },
      {
        heading: "Selectors first, reducers second",
        paragraphs: [
          "I've started writing selectors before reducers. It makes me describe what the consumer needs before deciding what's convenient to store — and it often shows that some state doesn't need to be stored at all, because it can be derived. It's the same rule as `computed()` in a signal service, applied to the store.",
          "`createFeature` helps here: it generates a selector per top-level field, so the hand-written selectors are only the ones that mean something.",
        ],
      },
      {
        heading: "Effect patterns that age well",
        paragraphs: [
          "Effects are where NgRx sprawls. I've seen effects files grow to 600 lines with a dozen side effects per action; that usually means the action granularity is wrong. One effect per distinct side effect — the boilerplate is cheap, the clarity isn't.",
          "The bug I see most often in effects is `catchError` in the wrong place. Put it on the outer stream and the first failed request completes the effect: it never runs again until the page reloads, and nothing in the console says so. It belongs inside the flattening operator, around the one request that can fail:",
        ],
        code: {
          language: "typescript",
          source: `export const loadUsers = createEffect(
  (actions$ = inject(Actions), api = inject(UsersApi)) =>
    actions$.pipe(
      ofType(UsersPageActions.opened, UsersPageActions.filterChanged),
      switchMap(({ filter }) =>
        api.list(filter).pipe(
          map((users) => UsersApiActions.loaded({ users })),
          // Inside switchMap: one failure becomes an action, the effect lives on.
          catchError((error: unknown) => of(UsersApiActions.loadFailed({ error: toMessage(error) }))),
        ),
      ),
    ),
  { functional: true },
);`,
        },
      },
      {
        heading: "Choosing the flattening operator",
        paragraphs: [
          "The other source of subtle bugs is the operator. The wrong one doesn't fail loudly; it drops a request, or applies two in the wrong order, once in a hundred times.",
          "`switchMap` for queries: a new filter cancels the old request, the latest result wins. `concatMap` for mutations whose order matters: two edits to the same record are applied as the user made them. `exhaustMap` for actions that should not repeat while one is in flight — submit, log in, pay — so a double click doesn't charge twice. `mergeMap` for independent operations on different items, like deleting two separate rows, where neither should wait for or cancel the other.",
        ],
      },
      {
        heading: "The questions I ask before adding state",
        paragraphs: [
          "Put together, this is the order I go through whenever something new needs to be remembered. Does the server own it? Then it's a cache — a query library or a service that treats it as one. Should a link reproduce it? Then it's a query parameter. Does anything outside this component need it? If not, it's a local signal. Can it be calculated from state that already exists? Then it's `computed()` or a selector, not new state.",
          "Only what survives all four questions is shared client state — and for that, a signal service until it needs cancellation, an action log or coordination across features, and the NgRx store from then on. The store stopped being the default in my projects. It became the tool for the part of the state that actually earns it.",
        ],
      },
    ],
  },
];
