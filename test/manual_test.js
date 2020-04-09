/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const util = require('util');
const faker = require("faker");
const User = require("./../models/User");
const db_init = require("../services/db/db_init");
const dbUser = require("../services/db/dbUser");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");
const config = require("../config/config");
const logger = require("../services/logger").child({
    service: "server:manualtest:db",
    inspect_depth: 5
});

// async function looping() {
//     let the_time = 0;
//     for (let di = 0; di < 200; di++) {
//         const start = Date.now();
//         // eslint-disable-next-line no-await-in-loop
//         await dbUser.getAllUsers();
//         the_time += Date.now() - start;
//     }
//     await db_init.end();
//    logger.debug(`Test finished in ${the_time / 1000} seconds.
// ${the_time / 1000 / 200} in mean.`);
// }
// looping().then();

// const start = Date.now();
// dbUser.getAllUsers()
//     .then((rows) => {
//         logger.debug(rows);
//         db_init.end().then(() => logger.debug("Pool closed."));
//         const millis = Date.now() - start;
//         logger.debug(`Test finished in ${millis / 1000} seconds. ${rows.length} rows fetched.`);
//     })
//     .catch((err) => {
//         logger.debug(err);
//     })
//     .then(() => {

//     });

// dbPermission.getAllPermissions()
//     .then((rows) => {
//         logger.debug(rows);
//     })
//     .catch((err) => {
//         logger.debug(err);
//     })
//     .then(() => {
//         db_init.end().then(() => logger.debug("Pool closed."));
//         const millis = Date.now() - start;
//         logger.debug(`Test finished in ${millis / 1000} seconds.`);
//     });


// async function tryIt() {
//     const pool = db_init.getPool();
//     console.log(config);
//     console.log(await pool.query("SELECT COUNT(id) FROM users WHERE id = $1;", [8]));
//     await pool.end();
// }

// tryIt().then();
