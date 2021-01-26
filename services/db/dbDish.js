const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbDish"
// });
const Dish = require("../../models/Dish");
const Role = require("../../models/Role");
const dbRole = require("./dbRole");
const logger = require("../logger").child({
    service: "server:services:db:dbDish"
});

/**
 * Get all dishes from the database, prices at the given datetime.
 * @param {Date} [datetime]
 * @returns {Promise<Dish[]>}
 */
async function getAllDishes(datetime) {
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for dish in database.");
    }

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const queryText = `SELECT DCP3.*,
                        COALESCE(json_agg(json_build_object('name', D_O.name, 'price_change', D_O.price_change)) 
                                 FILTER (WHERE D_O.name IS NOT NULL), '[]')::json as options
                    FROM (SELECT DCP2.*, 
                        COALESCE(json_object_agg(DRP.rank_id, DRP.price) 
                                 FILTER (WHERE DRP.rank_id IS NOT NULL), '{}')::jsonb as roles_prices

                        FROM (SELECT D.*, COALESCE(DCP.price, 0) as cost_price 
                                FROM dishes D
                                LEFT JOIN (SELECT DISTINCT ON (dish_id) dish_id, price 
                                        FROM dishes_cost_prices date WHERE date <= $1
                                        ORDER BY dish_id, date DESC
                                        ) DCP on DCP.dish_id = D.id
                            ) AS DCP2
                        LEFT JOIN (SELECT DISTINCT ON (rank_id, dish_id) rank_id, dish_id, price
                                    FROM dishes_ranked_prices WHERE date <= $1
                                    ORDER BY rank_id, dish_id, date DESC
                                    ) AS DRP on DRP.dish_id = DCP2.id
                        GROUP BY DCP2.id, DCP2.name, DCP2.image, DCP2.description,
                                 DCP2.hidden, DCP2.deleted, DCP2.cost_price
                        ) AS DCP3
                    LEFT JOIN dishes_options D_O ON D_O.dish_id = DCP3.id
                    GROUP BY DCP3.id, DCP3.name, DCP3.image, DCP3.description, DCP3.hidden, 
                                      DCP3.deleted, DCP3.cost_price, DCP3.roles_prices
                    ORDER BY DCP3.id;`;
    const {
        rows
    } = await db_init.getPool().query(queryText, [checkdate]);
    // logger.debug(rows)
    const dishes = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const dish = new Dish();
            dish._id = row.id;
            dish.name = row.name;
            dish.image = row.image;
            dish.description = row.description;
            dish.hidden = row.hidden;
            dish.deleted = row.deleted;

            dish.roles_prices = row.roles_prices;
            dish.cost_price = row.cost_price;
            dish.options = row.options;

            // FIXME: Add ingredients

            dishes.push(dish);
        }
    });
    return dishes;
}

/**
 * Get a dish from the database. You just need to set his _id in the parameter.
 * Prices at the given datetime.
 * @param {Dish} askedDish
 * @param {Date} [datetime]
 * @returns {Promise<Dish>}
 */
async function getDish(askedDish, datetime) {
    if (!(askedDish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't search for dish in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for dish in database.");
    }
    if (!askedDish._id) {
        throw new Error("Dish id undefined: can't search for dish in database.");
    }

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const queryText = `SELECT DCP3.*,
                        COALESCE(json_agg(json_build_object('name', D_O.name, 'price_change', D_O.price_change)) 
                                 FILTER (WHERE D_O.name IS NOT NULL), '[]')::json as options
                    FROM (SELECT DCP2.*, 
                        COALESCE(json_object_agg(DRP.rank_id, DRP.price) 
                                 FILTER (WHERE DRP.rank_id IS NOT NULL), '{}')::jsonb as roles_prices
                        FROM (SELECT D.*, COALESCE(DCP.price, 0) as cost_price 
                                FROM dishes D
                                LEFT JOIN (SELECT DISTINCT ON (dish_id) dish_id, price 
                                        FROM dishes_cost_prices date WHERE date <= $1
                                        ORDER BY dish_id, date DESC
                                        ) DCP on DCP.dish_id = D.id
                                WHERE D.id = $2
                            ) AS DCP2
                        LEFT JOIN (SELECT DISTINCT ON (rank_id, dish_id) rank_id, dish_id, price
                                    FROM dishes_ranked_prices WHERE date <= $1
                                    ORDER BY rank_id, dish_id, date DESC
                                    ) AS DRP on DRP.dish_id = DCP2.id
                        GROUP BY DCP2.id, DCP2.name, DCP2.image, DCP2.description,
                                 DCP2.hidden, DCP2.deleted, DCP2.cost_price
                        ) AS DCP3
                    LEFT JOIN dishes_options D_O ON D_O.dish_id = DCP3.id
                    GROUP BY DCP3.id, DCP3.name, DCP3.image, DCP3.description, DCP3.hidden, 
                                      DCP3.deleted, DCP3.cost_price, DCP3.roles_prices
                    ORDER BY DCP3.id;`;
    const {
        rows
    } = await db_init.getPool().query(queryText, [checkdate, askedDish._id]);
    // logger.debug(rows)

    if (rows[0].id !== null) {
        const dish = new Dish();
        dish._id = rows[0].id;
        dish.name = rows[0].name;
        dish.image = rows[0].image;
        dish.description = rows[0].description;
        dish.hidden = rows[0].hidden;
        dish.deleted = rows[0].deleted;

        dish.roles_prices = rows[0].roles_prices;
        dish.cost_price = rows[0].cost_price;
        dish.options = rows[0].options;
        // FIXME: Add ingredients

        return dish;
    }
    return undefined;
}

/**
 * Add or Update a dish. Don't take into account the password. It will not add transactions anywhere.
 *
 * return the dish added.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function addOrUpdateDish(dish) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't add or update.");
    }
    if (!dish._id || !await dishExists(dish)) {
        return addDish(dish);
    }
    return updateDish(dish);
}

/**
 * Add a dish. Don't take into account the password. It will not add transactions anywhere.
 * Dish's prices will be added.
 *
 * Return the dish added.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function addDish(dish) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't add dish to database.");
    }
    if (dish._id && await dishExists(dish)) {
        logger.warn("You are adding a dish with a valid id to the database:", dish);
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO dishes (name, "
                                            + "image, "
                                            + "description, "
                                            + "hidden, "
                                            + "deleted) "
        + "VALUES ($1, $2, $3, $4, $5) RETURNING id;";

        const params = [
            dish.name,
            dish.image,
            dish.description,
            dish.hidden,
            dish.deleted
        ];

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        dish._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (dish.roles_prices) {
            Object.keys(dish.roles_prices).forEach((role_id) => {
                const role_temp = new Role();
                role_temp._id = parseInt(role_id);
                promises.push(
                    setRankedPrice(dish, role_temp,
                        dish.roles_prices[role_id], new Date(), client)
                );
            });
        }

        if (dish.cost_price) {
            promises.push(
                setCostPrice(dish, dish.cost_price, new Date(), client)
            );
        }

        if (dish.options) {
            dish.options.forEach((opt) => {
                promises.push(
                    client.query('INSERT INTO dishes_options (dish_id, name, price_change) VALUES ($1, $2, $3)',
                        [dish._id, opt.name, opt.price_change])
                );
            });
        }

        // FIXME: ingredients

        await Promise.all(promises);
        await client.query('COMMIT');

        return dish;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}

/**
 * Update a dish.
 * Dish's prices will be added.
 *
 * Return the dish updated.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function updateDish(dish) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't update dish in database.");
    }
    if (!dish._id) {
        throw new Error("Dish id was undefined: can't update dish.");
    }
    if (!await dishExists(dish)) {
        throw new Error("Dish doesn't exist in the database: can't update it.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM dishes WHERE id = $1;", [dish._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Dish id was not found in database: can't update dish.");
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "UPDATE dishes SET name = $1, "
                                            + "image = $2, "
                                            + "description = $3, "
                                            + "hidden = $4, "
                                            + "deleted = $5 "
        + "WHERE id = $6;";

        const params = [
            dish.name,
            dish.image,
            dish.description,
            dish.hidden,
            dish.deleted,
            dish._id
        ];

        await client.query(queryText, params);

        const promises = []; // array of promises to know when everything is done.

        if (dish.roles_prices) {
            Object.keys(dish.roles_prices).forEach((role_id) => {
                const role_temp = new Role();
                role_temp._id = parseInt(role_id);
                promises.push(
                    setRankedPrice(dish, role_temp,
                        dish.roles_prices[role_id], new Date(), client)
                );
            });
        }

        if (dish.cost_price) {
            promises.push(
                setCostPrice(dish, dish.cost_price, new Date(), client)
            );
        }

        await client.query("DELETE FROM dishes_options WHERE dish_id = $1;", [dish._id]);
        if (dish.options) {
            dish.options.forEach((opt) => {
                promises.push(
                    client.query('INSERT INTO dishes_options (dish_id, name, price_change) VALUES ($1, $2, $3)',
                        [dish._id, opt.name, opt.price_change])
                );
            });
        }

        // FIXME: ingredients

        await Promise.all(promises);

        await client.query('COMMIT');

        return dish;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}

/**
 * Return prices of a dish based on role at a choosen time in key/value: role_id:price.
 * @param {Dish} dish
 * @param {Date} [datetime]
 * @returns {Promise<Object.<number,price:number>>} role_id:price
*/
async function getRankedPrices(dish, datetime) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't get roles prices for dish in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't get roles prices for dish in database.");
    }
    if (!await dishExists(dish)) {
        throw new Error("Dish doesn't exist in the database: can't get its ranked price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT DISTINCT ON (rank_id) rank_id, price, date FROM dishes_ranked_prices "
                    + "WHERE dish_id = $1 AND date <= $2 "
                    + "ORDER BY rank_id, date DESC;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [dish._id, checkdate]);
    // logger.debug(rows)
    const roles_prices = {};

    rows.forEach((row) => {
        if (row.rank_id !== null) {
            roles_prices[row.rank_id.toString()] = row.price;
        }
    });

    return roles_prices;
}

/**
 * Return cost price of a dish at a choosen time. Return 0 if no price.
 * @param {Dish} dish
 * @param {Date} [datetime]
 * @returns {Promise<number>}
*/
async function getCostPrice(dish, datetime) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't get cost price for dish in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't get cost price for dish in database.");
    }
    if (!await dishExists(dish)) {
        throw new Error("Dish doesn't exist in the database: can't get its cost price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT price FROM dishes_cost_prices "
                    + "WHERE dish_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC LIMIT 1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [dish._id, checkdate]);
    // logger.debug(rows)
    if (rows[0] && rows[0].price !== null) {
        return rows[0].price;
    }
    return 0;
}

/**
 * Set the price of a dish for a role at a choosen time.
 * @param {Dish} dish
 * @param {Rank} role
 * @param {number} cost
 * @param {Date} [datetime]
 * @param {PoolClient} [client]
*/
async function setRankedPrice(dish, role, cost, datetime, client) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't change role price of dish in database.");
    }
    if (!(typeof cost === 'number')) {
        throw new Error("Arg wasn't a number: can't change role price of dish in database.");
    }
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't change role price of dish in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't change role price of dish in database.");
    }
    if (!await dishExists(dish, client)) {
        throw new Error("Dish doesn't exist in the database: can't change its ranked price.");
    }
    if (!await dbRole.roleExists(role, client)) {
        throw new Error("Role doesn't exist in database: can't change the related price of the dish.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    let client_used = client;
    if (!client) {
        client_used = db_init.getPool();
    }

    const queryText = "INSERT INTO dishes_ranked_prices "
                        + "(dish_id, "
                        + "rank_id, "
                        + "price, "
                        + "date) "
                        + "VALUES ($1, $2, $3, $4);";

    const params = [
        dish._id,
        role._id,
        cost,
        checkdate
    ];

    await client_used.query(queryText, params);
}

/**
 * Set the cost price of a dish at a choosen time.
 * @param {Dish} dish
 * @param {number} cost
 * @param {Date} [datetime]
 * @param {PoolClient} [client]
*/
async function setCostPrice(dish, cost, datetime, client) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't change cost price of dish in database.");
    }
    if (!(typeof cost === 'number')) {
        throw new Error("Arg wasn't a number: can't change cost price of dish in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't change cost price of dish in database.");
    }
    if (!await dishExists(dish, client)) {
        throw new Error("Dish doesn't exist in the database: can't change its cost price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    let client_used = client;
    if (!client) {
        client_used = db_init.getPool();
    }

    const queryText = "INSERT INTO dishes_cost_prices "
                        + "(dish_id, "
                        + "price, "
                        + "date) "
                        + "VALUES ($1, $2, $3);";

    const params = [
        dish._id,
        cost,
        checkdate
    ];

    await client_used.query(queryText, params);
}

/**
 * Check if dish exists using the id
 * @param {Dish} dish
 */
async function dishExists(dish, client) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't check for dish in database.");
    }
    if (!dish._id) {
        throw new Error("Dish id was undefined: can't check for dish in database.");
    }

    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(*) FROM dishes WHERE id = $1;", [dish._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Remove totally a dish.
 * @param {Dish} dish
 */
async function removeDish(dish) {
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't remove dish from database.");
    }
    if (!dish._id) {
        throw new Error("Dish id was undefined: can't remove dish from database.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM dishes WHERE id = $1;", [dish._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Dish id was not found in database: can't remove dish.");
    }

    await db_init.getPool().query("DELETE FROM dishes WHERE id = $1;", [dish._id]);
}

// TODO: add getter and setter of price by rank settings, and change functions to use them.

module.exports.getAllDishes = getAllDishes;
module.exports.addDish = addDish;
module.exports.removeDish = removeDish;
module.exports.dishExists = dishExists;
module.exports.updateDish = updateDish;
module.exports.addOrUpdateDish = addOrUpdateDish;
module.exports.getDish = getDish;
module.exports.getRankedPrices = getRankedPrices;
module.exports.getCostPrice = getCostPrice;
module.exports.setRankedPrice = setRankedPrice;
module.exports.setCostPrice = setCostPrice;
