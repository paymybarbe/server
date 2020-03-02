/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require("faker");
const User = require("./../models/User");
const db_init = require("../services/db/db_init");
const dbUser = require("../services/db/dbUser");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");
const logger = require("../services/logger").child({
    service: "server:manualtest:db",
    inspect_depth: 5
});

const start = Date.now();
dbUser.getAllUsers()
    .then((rows) => {
        // logger.debug(rows);
        db_init.getPool().end().then(() => logger.debug("Pool closed."));
        const millis = Date.now() - start;
        logger.debug(`Test finished in ${millis / 1000} seconds. ${rows.length} rows fetched.`);
    })
    .catch((err) => {
        logger.debug(err);
    })
    .then(() => {

    });

// dbPermission.getAllPermissions()
//     .then((rows) => {
//         logger.debug(rows);
//     })
//     .catch((err) => {
//         logger.debug(err);
//     })
//     .then(() => {
//         db_init.getPool().end().then(() => logger.debug("Pool closed."));
//         const millis = Date.now() - start;
//         logger.debug(`Test finished in ${millis / 1000} seconds.`);
//     });
