import { describe, expect, it } from "vitest";
import { type CodeLanguage, highlight, type TokenKind } from "./highlight";

/** The highlighted tokens only, as `kind:text`. */
function marked(source: string, language: CodeLanguage): string[] {
  return highlight(source, language)
    .filter((token): token is { text: string; kind: TokenKind } => Boolean(token.kind))
    .map((token) => `${token.kind}:${token.text}`);
}

describe("highlight", () => {
  const samples: Record<CodeLanguage, string> = {
    typescript: `@Component({ selector: "app-x" })\nexport class X {\n  // count\n  readonly n = signal(42);\n}`,
    html: `<!-- list -->\n@for (post of posts(); track post.slug) {\n  <a [routerLink]="post.slug">{{ post.title }}</a>\n}`,
    scss: `@use "brand";\n.card { color: var(--brand-ink); padding: 1.5rem !important; }`,
    shell: `# build\nnpm run build -- --base-href "/x/" && npx playwright test`,
  };

  it("gives the source back unchanged", () => {
    for (const [language, source] of Object.entries(samples)) {
      const text = highlight(source, language as CodeLanguage)
        .map((token) => token.text)
        .join("");
      expect(text).toBe(source);
    }
  });

  it("marks TypeScript", () => {
    expect(marked(samples.typescript, "typescript")).toEqual([
      "function:@Component",
      'string:"app-x"',
      "keyword:export",
      "keyword:class",
      "type:X",
      "comment:// count",
      "keyword:readonly",
      "function:signal",
      "number:42",
    ]);
  });

  it("does not take a keyword out of a longer identifier", () => {
    expect(marked("const imported = format;", "typescript")).toEqual(["keyword:const"]);
  });

  it("marks Angular templates", () => {
    expect(marked(samples.html, "html")).toEqual([
      "comment:<!-- list -->",
      "keyword:@for",
      "tag:<a",
      "attribute:[routerLink]",
      'string:"post.slug"',
      "tag:>",
      "function:{{",
      "function:}}",
      "tag:</a",
      "tag:>",
    ]);
  });

  it("leaves an apostrophe in template text alone", () => {
    expect(marked("<p>It's fine, isn't it</p>", "html")).toEqual([
      "tag:<p",
      "tag:>",
      "tag:</p",
      "tag:>",
    ]);
  });

  it("marks SCSS", () => {
    expect(marked(samples.scss, "scss")).toEqual([
      "keyword:@use",
      'string:"brand"',
      "tag:.card",
      "property:color",
      "type:--brand-ink",
      "property:padding",
      "number:1.5rem",
      "keyword:!important",
    ]);
  });

  it("marks shell commands and their flags", () => {
    expect(marked(samples.shell, "shell")).toEqual([
      "comment:# build",
      "function:npm",
      "attribute:--",
      "attribute:--base-href",
      'string:"/x/"',
      "function:npx",
    ]);
  });
});
