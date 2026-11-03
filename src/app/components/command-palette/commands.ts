export type CommandGroup = "Pages" | "Posts" | "Actions" | "Profiles";

export interface Command {
  /** Unique and stable; also the option's DOM id. */
  readonly id: string;
  readonly label: string;
  readonly group: CommandGroup;
  /** Extra words a search should find the command by. */
  readonly keywords?: string;
  readonly run: () => void;
}

/**
 * The commands matching `query`, best first. Every word of the query must appear in the
 * label, the keywords or the group; a label that starts with the query ranks first, then one
 * with a word starting with it, then the rest — each in the order given. An empty query
 * returns the list as given.
 */
export function filterCommands(commands: readonly Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [...commands];
  }

  const phrase = words.join(" ");
  return commands
    .map((command, index) => ({ command, index, rank: rank(command, words, phrase) }))
    .filter(({ rank }) => rank !== null)
    .sort((a, b) => a.rank! - b.rank! || a.index - b.index)
    .map(({ command }) => command);
}

function rank(command: Command, words: readonly string[], phrase: string): number | null {
  const label = command.label.toLowerCase();
  const haystack = `${label} ${command.keywords ?? ""} ${command.group}`.toLowerCase();
  if (!words.every((word) => haystack.includes(word))) {
    return null;
  }
  if (label.startsWith(phrase)) {
    return 0;
  }
  return label.split(/[^a-z0-9]+/).some((word) => word.startsWith(words[0]!)) ? 1 : 2;
}
