const RearError = require('../rear-error');

describe('rear-error', () => {
  it('Should have message, code, errno and other props', () => {
    const message = 'Test error message';
    const props = { code: 'ETEST', errno: 400, extras: ['rear-core'] };
    const expectedProps = { extras: props.extras }

    const err = new RearError(message, props);

    expect(err.message).toBe(message);
    expect(err.code).toEqual(props.code);
    expect(err.errno).toEqual(props.errno);
    expect(err.props).toEqual(expectedProps);
  });

  it('Should include the error message in the stack trace', () => {
    const message = 'Test error message';
    const props = { code: 'ETEST', errno: 500 };
    const err = new RearError(message, props);

    expect(err.stack).toBeDefined();
    expect(err.stack.split('\n')[0].indexOf(message) !== -1).toBeTruthy();
  });
})
