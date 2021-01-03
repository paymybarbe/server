const pg = require('pg');
const path = require("path");
const Postgrator = require('postgrator');
const config = require("../../config/config");
const logger = require("../logger").child({
    service: "server:services:db:dbinit"
});

const dbConfig = {
    database: config.database.database,
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password
};
// console.log({
//     // Directory containing migration files
//     migrationDirectory: path.resolve(__dirname, 'migrations/'),
//     // Driver: must be pg, mysql, mysql2 or mssql
//     driver: 'pg',
//     // Database connection config
//     ...dbConfig,
//     // Schema table name. Optional. Default is schemaversion
//     // If using Postgres, schema may be specified using . separator
//     // For example, { schemaTable: 'schema_name.table_name' }
//     schemaTable: 'migrationTracker'
// });
const postgrator = new Postgrator({
    // Directory containing migration files
    migrationDirectory: path.resolve(__dirname, 'migrations/'),
    // Driver: must be pg, mysql, mysql2 or mssql
    driver: 'pg',
    // Database connection config
    ...dbConfig,
    // Schema table name. Optional. Default is schemaversion
    // If using Postgres, schema may be specified using . separator
    // For example, { schemaTable: 'schema_name.table_name' }
    schemaTable: "migration_tracking"
});

async function migrate(vers = '') {
    try {
        const appliedMigrations = await postgrator.migrate(vers);
        if (Object.keys(appliedMigrations).length !== 0) {
            logger.silly("Migrated: ", appliedMigrations);
        }
    }
    catch (error) {
        error.database = dbConfig.database;
        logger.error(error);
        // Because migrations prior to the migration with error would have run
        // error object is decorated with appliedMigrations
        process.exit(-1);
    }

    // Migrate to max version (optionally can provide 'max')
    // postgrator
    //     .migrate()
    //     .then((appliedMigrations) => console.log(appliedMigrations))
    //   .catch((error) => console.log(error));
}

let pool = new pg.Pool(dbConfig);

/**
 * Initialize a new pool for the database with the actual configuration or give the existing one.
 * This pool should only be ended with db_init.end().
 * @returns pg.Pool
 */
module.exports.getPool = () => {
    if (!pool) {
        pool = new pg.Pool(dbConfig);
    }
    return pool;
};

/**
 * End the current pool. This should be used instead of ending the pool directly.
 */
module.exports.end = async function end() {
    if (pool) {
        await pool.end();
        pool = null;
    }
};
module.exports.migrate = migrate;
logger.silly("dbinit was called.");
