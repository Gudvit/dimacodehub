import type { CodeLanguage } from "../code/highlight";

export interface CodeBlock {
  readonly language: CodeLanguage;
  readonly source: string;
}

export interface BlogPostSection {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
  readonly code?: CodeBlock;
}

export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly preview: string;
  readonly readingTime: number;
  readonly sections: readonly BlogPostSection[];
}
