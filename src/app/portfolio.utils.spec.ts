import { describe, expect, it } from 'vitest';
import { summarizeStack, toKebabCase } from './portfolio.utils';

describe('portfolio utils', () => {
  it('summarizes a stack with bullets', () => {
    expect(summarizeStack(['Angular', 'RxJS', 'Vitest'])).toBe(
      'Angular • RxJS • Vitest',
    );
  });

  it('turns labels into kebab-case', () => {
    expect(toKebabCase('Digital Studio')).toBe('digital-studio');
  });
});
