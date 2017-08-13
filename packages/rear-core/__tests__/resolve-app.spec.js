const resolveApp = require('../resolve-app');

it('should resolve path from app', () => {
  const thisFile = resolveApp('./__tests__/resolve-app.spec.js');
  expect(thisFile).toBe(__filename);
});
