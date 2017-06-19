const pkg = require('../get-package-json')();

test('Should get local package.json', () => {
  expect(pkg).toBeDefined();
  expect(pkg.hasOwnProperty('name')).toBeTruthy();
  expect(pkg.hasOwnProperty('version')).toBeTruthy();
});
