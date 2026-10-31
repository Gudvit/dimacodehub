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
      "AI features aren't a new category of problem — they're existing frontend problems under new pressure. Here's what actually changes when you add an LLM to a production UI.",
    readingTime: 6,
    sections: [
      {
        paragraphs: [
          "I've been integrating AI features into frontend products for over a year now. Chat interfaces, inline suggestions, semantic search, summarization flows. And the most consistent observation I can share is this: AI doesn't introduce fundamentally new engineering problems. It takes the problems you already have — async state, error handling, loading UX, perceived performance — and makes them harder to ignore.",
          "Here's what I've actually had to rethink when building for AI.",
        ],
      },
      {
        heading: "Streaming changes everything about loading states",
        paragraphs: [
          "Most AI responses are streamed. The server sends tokens incrementally over a long-lived connection, and your UI needs to reflect that in real time. This breaks the standard request/response mental model that most frontend code is built around.",
          "The naive approach — wait for the full response, then render — feels broken to users. A 3-second blank wait followed by a wall of text is far worse than text appearing word by word, even if the total latency is identical. Streaming makes latency feel interactive rather than blocking.",
          "Implementing this well in Angular means thinking about SSE (Server-Sent Events) or WebSocket streams, managing a signal or BehaviorSubject that updates as chunks arrive, and rendering incrementally. The tricky part is that you're essentially building a live, append-only document — and you need to handle mid-stream errors, unexpected stream closures, and markdown that renders correctly even when partially received.",
        ],
      },
      {
        heading: "Error handling is more visible than ever",
        paragraphs: [
          "In a standard API call, an error is binary: the request either succeeds or fails. With AI, there's a spectrum. The model might produce a response that is technically valid but completely wrong for the user's intent. The stream might cut off halfway. The model might refuse to answer. Rate limits might kick in after several successful requests.",
          "All of these need distinct UI handling. A mid-stream failure should show what was generated so far, not discard it. A refusal should be surfaced clearly, not silently replaced with an empty state. Rate limit errors need a user-facing message, not a raw HTTP 429.",
          "The discipline required here is the same discipline good error handling always demands — explicit states, not implicit ones. But AI makes bad error handling immediately painful in a way that a standard REST endpoint rarely does.",
        ],
      },
      {
        heading: "Perceived performance matters more than actual performance",
        paragraphs: [
          "LLM inference is slow. First-token latency is often 500ms–2s even for fast providers. This is a UX constraint you can't engineer away — you can only design around it.",
          "What I've found most effective: show something within 200ms of the user action, always. That something might be a skeleton, a 'thinking' indicator, or the beginning of a response. The exact content matters less than the signal that the system acknowledged the request and is working.",
          "The psychological research on this is clear: perceived wait time is a function of feedback, not elapsed time. Users tolerate 3-second waits with good feedback far better than 1-second waits with none.",
        ],
      },
      {
        heading: "Where does AI logic actually belong?",
        paragraphs: [
          "A question I get asked often: should prompt construction live in the frontend or the backend? My answer is almost always the backend — and here's why.",
          "Prompts contain your product logic. They encode how your product interprets user input, what context it provides the model, what constraints it enforces. Exposing that in client-side code means exposing it to users. It also means every prompt change requires a frontend deploy.",
          "The frontend's job is to collect user input cleanly, stream and render the response, and handle states. The backend's job is to own the model interaction. This boundary is clean and survives well as AI capabilities change — you can swap models, tweak prompts, add RAG context, all without touching the UI.",
        ],
      },
      {
        heading: "What hasn't changed",
        paragraphs: [
          "The fundamentals don't change. Good component boundaries, clean state management, explicit error states, accessible UI — all of this matters exactly as much as it did before AI entered the picture.",
          "If anything, AI features raise the bar on engineering quality because the failure modes are more visible. A poorly handled loading state in a standard form is annoying. The same in an AI chat interface feels broken. The margin for 'good enough' gets thinner.",
          "The engineers who will do this well aren't the ones who know the most about LLMs. They're the ones who already cared about UX detail, state correctness, and the craft of building interfaces that feel solid. AI just gives them a new surface to apply that craft.",
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
      "After years of building Angular applications for tens of thousands of users, I've learned that good architecture is invisible — it's what lets a team move fast without breaking things.",
    readingTime: 7,
    sections: [
      {
        paragraphs: [
          "I've spent most of my career working on Angular products that grew beyond what anyone initially planned for. A CRM used across Europe. A healthcare platform with 50K+ active users. Products where the team doubled and the feature scope tripled over two years.",
          "What I've found is that the architectural decisions you make in the first few months tend to live with you for years. This post is about the patterns I've settled on — not because they're theoretically elegant, but because they've proven themselves under real-world load.",
        ],
      },
      {
        heading: "Keep your components dumb",
        paragraphs: [
          "The single highest-leverage rule in any Angular codebase: push as much logic as possible out of your components. Components should be thin — they accept inputs, emit outputs, and delegate everything else.",
          "This means no direct HTTP calls in components. No business logic. Minimal derived state. If a component is doing something complex, that complexity belongs in a service, a store selector, or a pure function.",
          "The payoff is testability. A component with zero injected services is trivially unit-tested. A component with three injected services and business logic scattered through its lifecycle hooks is a nightmare.",
        ],
      },
      {
        heading: "State management is about boundaries",
        paragraphs: [
          "NgRx gets a reputation for being verbose, and it is. But the verbosity is doing real work — it forces you to make explicit decisions about what state lives where, who owns it, and how it changes.",
          "The mistake most teams make is putting everything in the store. Not every piece of state needs NgRx. Local UI state (is this dropdown open? which tab is selected?) belongs in the component. Server-fetched data that multiple features share belongs in the store.",
          "I use a simple rule: if two distinct feature modules need the same data, it goes in the store. If only one component needs it, keep it local. That boundary stays clear as the app grows.",
        ],
      },
      {
        heading: "Feature modules vs standalone components",
        paragraphs: [
          "With Angular 14+ and the push toward standalone, I've moved away from feature modules for new code. Standalone components are simpler to reason about — the dependency graph is explicit at the component level rather than hidden inside a module declaration.",
          "For existing NgModule-based codebases, I don't recommend a big-bang migration. Instead, introduce standalone components at the edges and work inward. Angular supports mixing both approaches.",
          "The bigger win from standalone isn't the syntax change — it's the improved lazy loading granularity. You can now lazy-load at the route level without creating a dedicated module just to hold one component.",
        ],
      },
      {
        heading: "What I would do differently",
        paragraphs: [
          "If I were starting a large Angular project today, I'd invest heavily upfront in three things: a clear state management policy (document what goes in the store), a strict boundary between feature code and shared code, and E2E tests for every critical user flow before the first major release.",
          "The E2E tests especially. We added Playwright to a mature product and the confidence it gave the team to refactor was immediately visible in velocity. Don't wait until you're afraid to deploy.",
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
      "NgRx is powerful, but it's also easy to overcomplicate. After using it across multiple large-scale products, here's what I've distilled into practical patterns.",
    readingTime: 5,
    sections: [
      {
        paragraphs: [
          "State management is one of those topics where the gap between theory and practice is enormous. You can read all the Redux documentation and still build yourself a tangled mess once the app grows past a certain complexity.",
          "This is what I've learned after building NgRx-based frontends in production environments — the rules I follow, the patterns I've abandoned, and the questions I ask before adding new state.",
        ],
      },
      {
        heading: "Not everything belongs in the store",
        paragraphs: [
          "The most common NgRx mistake I see in codebases is treating the store as a global variable dump. Every piece of data ends up there, regardless of whether it needs to be shared or persisted.",
          "I use a simple mental model: the store is for state that crosses feature boundaries or needs to survive navigation. Everything else stays local. A form's validation state, a tooltip's open/closed state, pagination UI — these are component concerns.",
          "When you keep the store lean, selectors stay fast, actions stay meaningful, and the DevTools timeline stays readable.",
        ],
      },
      {
        heading: "Selectors as your API",
        paragraphs: [
          "Selectors are underutilized. Most teams write one selector per piece of raw state and then compute everything inline in the component. This is a mistake.",
          "Treat selectors as the public API of your state slice. If a component needs 'the list of active users sorted by last login', that computation belongs in a selector — not in a `computed()` or a template pipe. Selectors are memoized, composable, and independently testable.",
          "I've started defining selectors first, before writing any reducers, because they force me to think about what the consumer actually needs rather than what's convenient to store.",
        ],
      },
      {
        heading: "Effect patterns that age well",
        paragraphs: [
          "Effects are where NgRx tends to sprawl. I've seen effects files grow to 600 lines with a dozen different side effects per action. That's a sign that the action granularity is wrong.",
          "One pattern that's helped: one effect per distinct side effect. Don't have a single effect that fires an API call, updates a loading state, handles errors, and dispatches a success action. Split those concerns. The boilerplate cost is low; the clarity benefit is high.",
          "Also: be careful with `exhaustMap` vs `switchMap` vs `concatMap`. Wrong choice here causes subtle bugs. I default to `switchMap` for queries (latest result wins) and `concatMap` for mutations (order matters).",
        ],
      },
      {
        heading: "When to reach for something simpler",
        paragraphs: [
          "I've been on projects where the complexity of NgRx clearly outweighed the benefits. For smaller apps or feature areas where state is mostly server-driven with minimal local complexity, I now reach for Angular's own signals + a simple service instead.",
          "Signals (from Angular 16+) combined with a service that wraps HTTP calls cover a wide range of use cases without the boilerplate overhead of actions, reducers, and effects. I only introduce NgRx when I need its specific strengths: time-travel debugging, strict action log, or complex cross-feature state coordination.",
        ],
      },
    ],
  },
];
