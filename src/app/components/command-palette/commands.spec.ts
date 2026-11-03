import { describe, expect, it } from "vitest";
import { type Command, filterCommands } from "./commands";

const command = (label: string, group: Command["group"], keywords?: string): Command => ({
  id: label,
  label,
  group,
  keywords,
  run: () => undefined,
});

describe("filterCommands", () => {
  const commands = [
    command("Home", "Pages"),
    command("Blog", "Pages", "posts articles"),
    command("Angular Architecture Patterns", "Posts", "Angular NgRx"),
    command("State Management in Production", "Posts", "Angular NgRx"),
    command("Switch to dark theme", "Actions", "theme mode"),
    command("Download CV", "Actions", "resume pdf"),
  ];
  const labels = (query: string) => filterCommands(commands, query).map((c) => c.label);

  it("returns everything, in order, for an empty query", () => {
    expect(labels("  ")).toEqual(commands.map((c) => c.label));
  });

  it("matches labels, keywords and groups, ignoring case", () => {
    expect(labels("RESUME")).toEqual(["Download CV"]);
    expect(labels("posts")).toEqual([
      "Blog",
      "Angular Architecture Patterns",
      "State Management in Production",
    ]);
  });

  it("needs every word of the query", () => {
    expect(labels("ngrx state")).toEqual(["State Management in Production"]);
  });

  it("ranks a label prefix first, then a word prefix, then the rest", () => {
    expect(labels("dow")).toEqual(["Download CV"]);
    // A word of the first label starts with it; the others only contain it ("articles",
    // "Angular", "dark"), so they keep their order.
    expect(labels("ar")).toEqual([
      "Angular Architecture Patterns",
      "Blog",
      "State Management in Production",
      "Switch to dark theme",
    ]);
  });

  it("finds nothing for an unknown word", () => {
    expect(labels("kubernetes")).toEqual([]);
  });
});
