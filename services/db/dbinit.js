const { Pool, Client } = require('pg');
const config = require("../../config/config");
const logger = require("../logger");

const pool = new Pool({
    connectionString: config.database.uri
});
pool.query('SELECT NOW()', (err, res) => {
    logger.info(err, res);
    pool.end();
});
const client = new Client({
    connectionString: config.database.uri
});
client.connect();
client.query('SELECT NOW()', (err, res) => {
    logger.info(err, res);
    client.end();
});
