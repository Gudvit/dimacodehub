export interface BlogPostSection {
  heading?: string;
  paragraphs: string[];
  code?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  preview: string;
  readingTime: number;
  sections: BlogPostSection[];
}
