test('Should create parametized query object', () => {
  const query = require('./query');
  const username = "test";
  const password = "test01";
  const sqlQuery = query.SQL`INSERT INTO Users (${username}, ${password})`;

  expect(typeof sqlQuery.text).toBe('string');
  expect(sqlQuery.values.length).toBe(2);
  expect(sqlQuery.text).toBe('INSERT INTO Users ($1, $2)');
  expect(sqlQuery.values).toEqual([username, password]);
});

test('Should fail on missing arguments', () => {
  const query = require('./query');

  try {
    const sqlQuery = query.SQL`INSERT INTO Users (${username}, ${password})`;
  }
  catch(err) {
    expect(err).toBeDefined();
    expect(err.constructor.name).toBe('ReferenceError');
    expect(err.message).toBe('username is not defined');
  }
});

test('Should exec query', (done) => {
  const db = require('./db');
  const {SQL, exec} = require('./query');

  const username = 'test';
  const password = 'test01';

  const config =  {
    user: 'express',
    password: 'express',
    database: 'express',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  };

  db.createPool(config);

  const resetQuery = SQL`DELETE FROM test;`;
  const insertQuery = SQL`INSERT INTO test VALUES(${username}, ${password});`;
  const selectQuery = SQL`SELECT * FROM test;`;
  return exec(resetQuery)
    .then(() => exec(insertQuery))
    .then(() => exec(selectQuery))
    .then(results => {
      expect(results.rows.length).toBe(1);
      done();
    });
});
