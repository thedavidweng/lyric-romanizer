import packageJson from '../package.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';

describe('package dependencies', () => {
  it('does not depend on the CommonJS Korean romanizer bundle', () => {
    expect(packageJson.dependencies).not.toHaveProperty('@romanize/korean');
  });
});
