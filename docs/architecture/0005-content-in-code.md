# 0005. Content lives in code, not in a CMS or markdown files

## Status

Accepted. In effect.

## Context

The site has three kinds of content: blog posts, the list of roles in the experience
section, and static section copy. There are three posts and six roles today, updated
rarely — a few times a year. The author of the content and the author of the code are the
same person.

The options were a headless CMS (an external service plus a data fetch), markdown files
plus a build-time parsing step, or plain TypeScript.

## Decision

Content is typed structures in the source:

- Posts are a private `BlogPost[]` array inside `BlogService`
  (`@Injectable({ providedIn: "root" })`), exposed through two synchronous methods:
  `getAll()` and `getBySlug()`.
- The post model is in `models/blog-post.model.ts`: `BlogPost` with an array of
  `BlogPostSection` (`heading?`, `paragraphs`, `code?`).
- Experience roles are an `ExperienceRole[]` field on the component.
- Post text is rendered through interpolation; HTML inside paragraphs is not supported.

The content contract is backed by unit tests in `blog.service.spec.ts`: slug uniqueness,
parseable dates, non-empty title/sections/paragraphs, positive `readingTime`.

## Consequences

- Zero runtime external dependencies: content is part of the bundle, served instantly,
  available offline, and cannot fail independently of the site.
- Publishing a post means a commit and a deploy. For three posts a year that is cheaper
  than running a CMS.
- The service is synchronous, so nothing in the app has loading/error states for data —
  which noticeably simplifies the components (see ADR 0006 and 0010).
- The price: content inflates the blog's chunk and is not cached separately from the
  code; fixing a typo requires a full redeploy.
- There is no markup inside the text — no links, no bold, no lists. When that becomes
  necessary, extend `BlogPostSection` with new fields rather than injecting HTML
  (otherwise a sanitizer and `[innerHTML]` come along with it).
- Moving to markdown/a CMS later is possible: `BlogService` exposes only two methods, so
  the change is making them asynchronous and updating all three consumers — the list
  component, the post component and the title resolver.
