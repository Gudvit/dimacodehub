export interface TagCount {
  readonly tag: string;
  readonly count: number;
}

/** Every tag in use, the most common first; ties in alphabetical order. */
export function countTags(tags: readonly string[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
