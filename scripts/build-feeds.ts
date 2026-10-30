/**
 * Writes `sitemap.xml` and `feed.xml` (RSS 2.0) next to the prerendered pages. Runs after
 * `ng build` in plain Node, which strips the types itself: the content files it imports have
 * type-only imports for that reason.
 *
 *   node scripts/build-feeds.ts dist/dimacodehub/browser
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_POSTS } from "../src/app/pages/blog/blog-posts.ts";
import { CASE_STUDIES } from "../src/app/pages/projects/case-studies.ts";
import { SITE_AUTHOR, SITE_URL, pageUrl } from "../src/app/site.ts";

const outDir = process.argv[2];
if (!outDir) {
  throw new Error("Usage: node scripts/build-feeds.ts <build output directory>");
}

const escapeXml = (text: string) =>
  text.replace(
    /[<>&'"]/g,
    (c) => `&${{ "<": "lt", ">": "gt", "&": "amp", "'": "apos", '"': "quot" }[c]};`,
  );

// Newest first, whatever the array order (BlogService.getLatest sorts the same way).
const posts = [...BLOG_POSTS].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
// The service hides drafts outside dev mode; this is a production artefact, so always.
const studies = CASE_STUDIES.filter((study) => !study.draft);

const pages: { readonly loc: string; readonly lastmod?: string }[] = [
  { loc: pageUrl(""), lastmod: posts[0]?.date },
  { loc: pageUrl("blog"), lastmod: posts[0]?.date },
  { loc: pageUrl("projects") },
  ...posts.map((post) => ({ loc: pageUrl(`blog/${post.slug}`), lastmod: post.date })),
  ...studies.map((study) => ({ loc: pageUrl(`projects/${study.slug}`) })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    ({ loc, lastmod }) =>
      `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>
`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_AUTHOR} — Blog`)}</title>
    <link>${pageUrl("blog")}</link>
    <atom:link href="${SITE_URL}feed.xml" rel="self" type="application/rss+xml" />
    <description>Thoughts on frontend engineering: architecture, performance, and lessons from building products that scale.</description>
    <language>en</language>
${posts
  .map((post) => {
    const url = pageUrl(`blog/${post.slug}`);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.preview)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

writeFileSync(join(outDir, "sitemap.xml"), sitemap);
writeFileSync(join(outDir, "feed.xml"), feed);
console.log(`Wrote sitemap.xml (${pages.length} pages) and feed.xml (${posts.length} posts).`);
