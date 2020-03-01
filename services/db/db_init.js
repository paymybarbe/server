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
module.exports.getPool = () => {
    if (!pool) {
        pool = new pg.Pool(dbConfig);
    }
    return pool;
};
module.exports.migrate = migrate;
logger.silly("dbinit was called.");
