export interface BlogPostSection {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
  readonly code?: string;
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
