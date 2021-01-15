/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const util = require('util');
const faker = require("faker");
const assert = require('assert');
const Application = require('spectron').Application;
const path = require('path');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const { debugPort } = require('process');
const User = require("../models/User");
const Product = require("../models/Product");
const db_init = require("../services/db/db_init");
const dbUser = require("../services/db/dbUser");
const dbProduct = require("../services/db/dbProduct");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");
const config = require("../config/config");
const seeder = require('../scripts/script.seed');
const logger = require("../services/logger").child({
    service: "server:manualtest:db",
    inspect_depth: 3
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
// const userr = new User();
// userr._id = 11;

// db_init.getPool().query("SELECT price FROM products_cost_prices "
//                         + "WHERE product_id = 0 AND date <= now() "
//                         + "ORDER BY date DESC LIMIT 1;").then((result) => {
//     logger.debug(result);
// });

// dbUser.getUser(userr).then((user) => {
//     logger.debug(user);
//     db_init.end();
// });

async function trythat() {
    await seeder.cleanDB();
    const permissions = await seeder.addPermissions(15);
    logger.debug("Permissions: ", permissions.length);
    const roles = await seeder.addRoles(10, permissions);
    logger.debug("Roles: ", roles.length);
    const products = await seeder.addProducts(45, roles);
    logger.debug("Products: ", products.length);
    const dishes = await seeder.addDishes(35, roles);
    logger.debug("Dishes: ", dishes.length);
    const categories = await seeder.addCategories(15, products);
    logger.debug("Categories: ", categories.length);
    const menus = await seeder.generateMenus(10, products, dishes, categories);
    logger.debug(menus[5]);
    await db_init.end();
}
trythat().then().catch((e) => logger.error(e));
