const { Pool } = require('pg');
const config = require("../../config/config");
const logger = require("../logger").child({
    service: "server:services:db:dbinit"
});

module.exports = new Pool({
    connectionString: config.database.uri
});
logger.silly("dbinit was called.");
