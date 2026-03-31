import { describe, expect, it } from 'vitest';
import { profile, projects, skills } from './portfolio.data';
import { buildTagline } from './portfolio.utils';

describe('portfolio', () => {
  it('builds a tagline using role and focus', () => {
    expect(buildTagline(profile.role, profile.focus)).toContain(profile.role);
  });

  it('ships at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('defines skill groups', () => {
    expect(skills.every((group) => group.items.length > 0)).toBe(true);
  });
});
