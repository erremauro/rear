const resolveApp = require('../resolve-app');

describe('resolve-app', () => {
  it('Should resolve path from app', () => {
    const thisFile = resolveApp('./__tests__/resolve-app.spec.js');
    expect(thisFile).toBe(__filename);
  });

  it('Should join multiple paths before resolving', () => {
    const thisFile = resolveApp('./__tests__/', 'resolve-app.spec.js');
    expect(thisFile).toBe(__filename);
  });
});
