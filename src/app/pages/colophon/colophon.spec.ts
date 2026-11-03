import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatKilobytes } from "./build-stats";
import { ADRS, COVERAGE_FLOOR, PIPELINE } from "./colophon";

// The colophon states facts about the repository. These hold it to the files it describes,
// so the page cannot drift into claims the code no longer backs.
describe("colophon facts", () => {
  it("lists every architecture decision record under its own title", () => {
    const records = readdirSync("docs/architecture")
      .filter((file) => /^\d{4}-.+\.md$/.test(file))
      .sort()
      .map((file) => {
        const heading = readFileSync(`docs/architecture/${file}`, "utf8").split("\n")[0];
        const [, number, title] = /^# (\d{4})\. (.+)$/.exec(heading) ?? [];
        return { number, title: title?.replaceAll("`", ""), file };
      });

    expect(ADRS).toEqual(records);
  });

  it("names only steps the CI workflow really has, in its order", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
    const steps = [...workflow.matchAll(/- name: (.+)/g)].map(([, name]) => name);
    const positions = PIPELINE.map(({ step }) => steps.indexOf(step));

    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("quotes the coverage floor the builder enforces", () => {
    const config = JSON.parse(readFileSync("angular.json", "utf8"));
    const thresholds = config.projects.dimacodehub.architect.test.options.coverageThresholds;
    expect(thresholds).toMatchObject(COVERAGE_FLOOR);
  });
});

describe("formatKilobytes", () => {
  it("shows decimal kilobytes with one digit", () => {
    expect(formatKilobytes(128873)).toBe("128.9 kB");
    expect(formatKilobytes(0)).toBe("0.0 kB");
  });
});
