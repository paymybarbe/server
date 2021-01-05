const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbDish"
// });
const Dish = require("../../models/Dish");

/**
 * Get all dishes from the database.
 * @returns {Promise<Dish[]>}
 */
async function getAllDishes() {
    const queryText = "SELECT * FROM dishes;";
    const {
        rows
    } = await db_init.getPool().query(queryText);
    // logger.debug(rows)
    const dishes = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const dish = new Dish();
            dish._id = row.id;
            dish.name = row.name;
            dish.image = row.image;
            dish.description = row.description;
            dish.threshold = row.threshold;
            dish.fixed_threshold = row.fixed_threshold;
            dish.hidden = row.hidden;
            dish.deleted = row.deleted;

            dish.roles_prices = getRankedPrices(dish);
            dish.menu_price = getMenuPrice(dish);
            dish.cost_price = getCostprice(dish);

            dishes.push(dish);
        }
    });

    for (let i = 0; i < dishes.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        dishes[i].roles_prices = await dishes[i].roles_prices;
        // eslint-disable-next-line no-await-in-loop
        dishes[i].menu_price = await dishes[i].menu_price;
        // eslint-disable-next-line no-await-in-loop
        dishes[i].cost_price = await dishes[i].cost_price;
    }
    return dishes;
}

/**
 * Return prices of a dish based on rank at a choosen time in key/value: role_id:price.
 * @param {Dish} dish
 * @param {Date} datetime
 * @returns {Promise<Object.<number,price:number>>} role_id:price
*/
async function getRankedPrices(dish, datetime) { // FIXME: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't get roles prices for dish in database.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT DISTINCT ON (rank) rank, price FROM dishes_ranked_prices "
                    + "WHERE dish_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [dish._id, checkdate]);
    // logger.debug(rows)
    const roles_prices = {};

    rows.forEach((row) => {
        if (row.rank !== null) {
            roles_prices[row.rank.toString()] = row.price;
        }
    });

    return roles_prices;
}

/**
 * Return price of a dish in a menu at a choosen time. Return -1 if no price.
 * @param {Dish} dish
 * @param {Date} datetime
 * @returns {Promise<number>}
*/
async function getMenuPrice(dish, datetime) { // FIXME: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't get menu price for dish in database.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT price FROM dishes_menu_prices "
                    + "WHERE dish_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC LIMIT 1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [dish._id, checkdate]);
    // logger.debug(rows)

    if (rows[0].price !== null) {
        return rows[0].price;
    }
    return -1;
}

/**
 * Return cost price of a dish at a choosen time. Return -1 if no price.
 * @param {Dish} dish
 * @param {Date} datetime
 * @returns {Promise<number>}
*/
async function getCostprice(dish, datetime) { // FIXME
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't get cost price for dish in database.");
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
    if (rows[0].price !== null) {
        return rows[0].price;
    }
    return -1;
}

/**
 * Get a dish from the database. You just need to set his _id in the parameter.
 * @param {Dish} askedDish
 * @returns {Promise<Dish>}
 */
async function getDish(askedDish) { // FIXME
    if (!(askedDish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't search for dish in database.");
    }
    if (!askedDish._id) {
        throw new Error("Dish id undefined: can't search for dish in database.");
    }
    const queryText = "SELECT * FROM dishes P WHERE id = $1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [askedDish._id]);
    // logger.debug(rows)

    if (rows[0].id !== null) {
        const dish = new Dish();
        dish._id = rows[0].id;
        dish.name = rows[0].name;
        dish.image = rows[0].image;
        dish.stock = rows[0].stock;
        dish.description = rows[0].description;
        dish.threshold = rows[0].threshold;
        dish.fixed_threshold = rows[0].fixed_threshold;
        dish.hidden = rows[0].hidden;
        dish.deleted = rows[0].deleted;

        dish.roles_prices = getRankedPrices(dish);
        dish.menu_price = getMenuPrice(dish);
        dish.cost_price = getCostprice(dish);
        dish.roles_prices = await dish.roles_prices;
        dish.menu_price = await dish.menu_price;
        dish.cost_price = await dish.cost_price;

        return dish;
    }
    return undefined;
}

/**
 * Add or Update a dish. Don't take into account the password. It will not add transactions anywhere.
 * Dish's prices are not changed.
 *
 * return the dish added.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function addOrUpdateDish(dish) { // FIXME
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't add or update.");
    }
    if (!dish._id) {
        await addDish(dish);
    }
    else {
        await updateDish(dish);
    }
}

/**
 * Add a dish. Don't take into account the password. It will not add transactions anywhere.
 * Dish's prices are not changed.
 *
 * Return the dish added.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function addDish(dish) { // FIXME
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't add dish to database.");
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

        // TODO: Ingredients, Options

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
 * Dish's prices are not changed.
 *
 * Return the dish updated.
 * @param {Dish} dish
 * @returns {Promise<Dish>}
 */
async function updateDish(dish) { // FIXME: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
    if (!(dish instanceof Dish)) {
        throw new Error("Arg wasn't of Dish type: can't update dish in database.");
    }
    if (!dish._id) {
        throw new Error("Dish id was undefined: can't update dish.");
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
                                            + "stock = $3, "
                                            + "description = $4, "
                                            + "threshold = $5, "
                                            + "fixed_threshold = $6, "
                                            + "hidden = $7, "
                                            + "deleted = $8 "
        + "WHERE id = $9;";

        const params = [
            dish.name,
            dish.image,
            dish.stock,
            dish.description,
            dish.threshold,
            dish.fixed_threshold,
            dish.hidden,
            dish.deleted,
            dish._id
        ];

        await client.query(queryText, params);

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
 * Remove totally a dish.
 * @param {Dish} dish
 */
async function removeDish(dish) { // FIXME: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
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

// TODO: add setter of price by rank, cost price.

// TODO: add getter and setter of price by rank settings, by menu settings.

module.exports.getAllDishes = getAllDishes;
module.exports.addDish = addDish;
module.exports.removeDish = removeDish;
module.exports.updateDish = updateDish;
module.exports.addOrUpdateDish = addOrUpdateDish;
module.exports.getDish = getDish;
module.exports.getRankedPrices = getRankedPrices;
module.exports.getMenuPrice = getMenuPrice;
module.exports.getCostprice = getCostprice;
