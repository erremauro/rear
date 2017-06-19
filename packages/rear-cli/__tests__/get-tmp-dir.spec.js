test('Should get temporary directory', () => {
  const getTemporaryDirectory = require('../lib/get-tmp-dir');
  expect.assertions(2);
  return getTemporaryDirectory()
    .then(obj => {
      expect(typeof obj.tmpdir).toBe('string');
      expect(typeof obj.cleanup).toBe('function');
      obj.cleanup();
    });
});
