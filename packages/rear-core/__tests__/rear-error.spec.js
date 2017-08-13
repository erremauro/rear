const RearError = require('../rear-error');

it('Should have code, errno and other props', () => {
  const errMessage = 'Test error message';
  const errProps = {
    code: 'ETEST',
    errno: 400,
    extras: ['rear-core', 'rear-logger']
  };
  const expectedErrProps = { extras: errProps.extras }

  const err = new RearError(errMessage, errProps);

  expect(err.message).toBe(errMessage);
  expect(err.code).toEqual(errProps.code);
  expect(err.errno).toEqual(errProps.errno);
  expect(err.props).toEqual(expectedErrProps);
});
