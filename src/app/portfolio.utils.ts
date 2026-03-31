export const buildTagline = (role: string, focus: string) =>
  `${role} focused on ${focus}.`;

export const toKebabCase = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const summarizeStack = (stack: string[]) => stack.slice(0, 3).join(' • ');
