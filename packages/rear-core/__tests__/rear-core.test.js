test('should resolve path from app', () => {
  const resolveApp = require('../resolve-app');
  const thisFile = resolveApp('./__tests__/rear-core.test.js');
  expect(thisFile).toBe(__filename);
});

test('Should get package.json', () => {
  const pkg = require('../get-package-json')();
  expect(pkg).toBeDefined();
  expect(pkg.hasOwnProperty('name')).toBeTruthy();
  expect(pkg.hasOwnProperty('version')).toBeTruthy();
});

xtest('Should open browser', () => {
  // test open-browser
})
