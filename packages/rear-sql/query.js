const db = require('./db');

module.exports = {
  SQL,
  exec,
}

////////////////////

/**
 * Compose a safe postgresql query for pg.Pool
 *
 * @param {Array<string>} parts  String template parts
 * @param {Array<string>} values String template values
 *
 * @return {ParametizedQuery} Pg parametrized query
 *
 * @example
 *
 *   SQL`INSERT INTO Users (${username}, ${password})`
 */

function SQL (parts, ...values) {
  return {
    text: parts.reduce((prev, curr, i) => prev + '$' + i + curr),
    values
  };
}

/**
 * Execute a sql query with pg.Pool
 *
 * @param  {ParametizedQuery} sqlQuery Parametized pg query object
 * @return {Promise<Object>}           Resolve with query results
 *
 * @example
 *
 *  const query = require('./query')
 *  const SQL = query.SQL
 *
 *  const id = 2
 *
 *  query.exec(SQL`SELECT * FROM "Users" WHERE id = ${id}`)
 *  .then((result) => {
 *    console.log('User', result.rows[0])
 *  })
 */

function exec(sqlQuery, poolName) {
  return new Promise((resolve, reject) => {
    db.connect((err, client, done) => {
      if (err) {
        reject(err);
      }
      client.query(sqlQuery, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    }, poolName || 'default', );
  });
}
