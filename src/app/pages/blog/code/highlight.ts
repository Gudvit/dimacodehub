/**
 * A small syntax highlighter for the code blocks in posts. It splits the source into
 * tokens the template renders as `<span>`s, so a post never needs `innerHTML`. Deliberately
 * shallow: comments, strings, numbers, keywords, types and the like are enough to make a
 * snippet readable; it does not parse anything (ADR 0023).
 */

export type CodeLanguage = "typescript" | "html" | "scss" | "shell";

export type TokenKind =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "function"
  | "tag"
  | "attribute"
  | "property";

export interface Token {
  readonly text: string;
  /** Absent for plain text: identifiers, operators, whitespace. */
  readonly kind?: TokenKind;
}

type Rule = readonly [kind: TokenKind | null, pattern: RegExp];

const TS_KEYWORDS =
  "abstract|as|async|await|break|case|catch|class|const|constructor|continue|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|keyof|let|new|null|of|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|yield";

const GRAMMARS: Record<CodeLanguage, readonly Rule[]> = {
  typescript: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["string", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y],
    ["number", /\b\d[\d_]*(?:\.\d+)?\b/y],
    ["keyword", new RegExp(`\\b(?:${TS_KEYWORDS})\\b`, "y")],
    ["function", /@[A-Za-z_$][\w$]*/y],
    ["type", /\b[A-Z][\w$]*/y],
    ["function", /[A-Za-z_$][\w$]*(?=\s*[(<])/y],
    [null, /[A-Za-z_$][\w$]*/y],
  ],
  html: [
    ["comment", /<!--[\s\S]*?-->/y],
    ["tag", /<\/?[A-Za-z][\w-]*|\/?>/y],
    // Only attribute values: an apostrophe in the text must not open a string.
    ["string", /(?<==)(?:"[^"]*"|'[^']*')/y],
    ["attribute", /[[(*#@]?[A-Za-z_][\w.:-]*[\])]*(?==)/y],
    ["keyword", /@(?:if|else|for|switch|case|default|defer|let|empty|placeholder|loading)\b/y],
    ["function", /\{\{|\}\}/y],
  ],
  scss: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ["string", /"[^"\n]*"|'[^'\n]*'/y],
    ["keyword", /@[\w-]+|!important\b/y],
    ["type", /\$[\w-]+|--[\w-]+/y],
    ["number", /-?\d*\.?\d+(?:%|[a-z]+\b)?/y],
    ["property", /[a-z-]+(?=\s*:[^:])/y],
    ["tag", /[.#&][\w-]+|::?[\w-]+/y],
    [null, /[\w-]+/y],
  ],
  shell: [
    ["comment", /#[^\n]*/y],
    ["string", /"(?:\\.|[^"\\])*"|'[^']*'/y],
    ["function", /(?<=^|\n|&&\s*|\|\s*)[\w./-]+/y],
    ["attribute", /--?[\w-]+/y],
    [null, /[\w./-]+/y],
  ],
};

/** Splits `source` into tokens; joining their text gives `source` back unchanged. */
export function highlight(source: string, language: CodeLanguage): Token[] {
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
    if (kind) {
      if (plain) {
        tokens.push({ text: plain });
        plain = "";
      }
      tokens.push({ text, kind });
    } else {
      plain += text;
    }
    index += text.length;
  }

  if (plain) {
    tokens.push({ text: plain });
  }
  return tokens;
}

function matchAt(
  rules: readonly Rule[],
  source: string,
  index: number,
): [TokenKind | null, string] | null {
  for (const [kind, pattern] of rules) {
    pattern.lastIndex = index;
    const text = pattern.exec(source)?.[0];
    if (text) {
      return [kind, text];
    }
  }
  return null;
}
