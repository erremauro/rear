const RearError = require('../rear-error');

test('Should have code and errno', () => {
  const errMessage = 'Test error message';
  const errProps = {
    code: 'ETEST',
    errno: 400,
    extras: ['rear-core', 'rear-logger']
  };

  const err = new RearError(errMessage, errProps);

  expect(err.message).toBe(errMessage);
  expect(err.props).toEqual(errProps);
  expect(err.code).toBe(errProps.code);
  expect(err.errno).toBe(errProps.errno);
});
