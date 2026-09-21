// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import postcss from 'postcss';

it('only enables animations and transitions when reduced motion is not requested', () => {
  const css = postcss.parse(readFileSync(new URL('../styles.css', import.meta.url), 'utf8'));
  const motion = [];
  css.walkDecls(/^(animation|transition)(-|$)/, (declaration) => {
    let parent = declaration.parent;
    let respectsPreference = false;
    while (parent) {
      if (parent.type === 'atrule' && parent.name === 'media' && parent.params.includes('prefers-reduced-motion: no-preference')) respectsPreference = true;
      parent = parent.parent;
    }
    motion.push(declaration);
    expect(respectsPreference, declaration.toString()).toBe(true);
  });
  expect(motion.length).toBeGreaterThan(0);
});
