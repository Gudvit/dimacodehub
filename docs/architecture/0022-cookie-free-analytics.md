# 0022. Cookie-free page views through GoatCounter

## Status

Accepted. In effect.

## Context

The site had no analytics at all, so there was no way to tell whether anyone read a post,
which pages a recruiter opened, or where visitors came from. The usual answer, Google
Analytics, sets cookies — which in the EU means a consent banner on a portfolio — and
loads a large third-party script that the CSP would have to allow and Lighthouse would
count against the page.

The requirements were modest: views per page, referrers, countries and devices. No user
profiles, no events beyond a page view.

## Decision

- **GoatCounter.** Open source, free for personal sites, no cookies and no personal data,
  so no consent banner. Plausible was the closer product but paid; Umami Cloud was free but
  offers custom events this site does not need.
- **No `count.js`.** GoatCounter's script only builds a request to `/count` from the path,
  title, referrer and screen size. `countPageViews()` (`src/app/analytics/page-views.ts`)
  does the same with `navigator.sendBeacon` on every `NavigationEnd` that changes the path,
  so a client-side route change counts like a page load and a jump to a heading or a blog
  tag filter does not. There is no third-party JavaScript on the page,
  and the CSP only gains the GoatCounter origin in `connect-src` — `index-html.spec.ts`
  fails if `GOATCOUNTER_ENDPOINT` and the policy disagree.
- **Only production counts.** The beacon is sent only when the page is served from the
  host in `SITE_URL` and runs in a browser. The prerender, the dev server, the e2e runs and
  the Lighthouse audit send nothing.
- **The referrer is sent once**, with the first view of a visit; later views are in-app
  navigations and their `document.referrer` would still name the original source.
- The title comes from the router's `TitleStrategy`, not `document.title`, which the router
  may update only after `NavigationEnd`.

## Consequences

- The GoatCounter site (`dimacodehub.goatcounter.com`) is registered by the owner, outside
  the repository. Until it exists, the beacons get a 404 and nothing else happens.
- Blockers that list `goatcounter.com` drop the beacon; the numbers undercount, which is
  acceptable for a portfolio.
- The beacon's sending path is not unit-tested: jsdom cannot pretend to be the production
  host. The spec covers the request format and that nothing is sent elsewhere.
- Moving to a custom domain means changing `SITE_URL`, which also moves the host that
  counts.
