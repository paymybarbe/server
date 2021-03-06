const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbProduct"
// });
const Product = require("../../models/Product");
const Role = require("../../models/Role");
const dbRole = require("./dbRole");
const logger = require("../logger").child({
    service: "server:services:db:dbProduct"
});

/**
 * Get all products from the database, prices at the given datetime.
 * @param {Date} [datetime]
 * @returns {Promise<Product[]>}
 */
async function getAllProducts(datetime) {
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for product in database.");
    }

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const queryText = `SELECT PCP2.*,
        COALESCE(json_object_agg(PRP.rank_id, PRP.price) 
                    FILTER (WHERE PRP.rank_id IS NOT NULL), '{}')::jsonb as roles_prices
        
        FROM (SELECT P.*, COALESCE(PCP.price, 0) as cost_price, COALESCE(PMP.price, 0) as menu_price 
                FROM products P
                LEFT JOIN (SELECT DISTINCT ON (product_id) product_id, price 
                        FROM products_cost_prices WHERE date <= $1
                        ORDER BY product_id, date DESC
                        ) PCP on PCP.product_id = P.id
                LEFT JOIN (SELECT DISTINCT ON (product_id) product_id, price 
                        FROM products_menu_prices WHERE date <= $1
                        ORDER BY product_id, date DESC
                        ) PMP on PMP.product_id = P.id
            ) AS PCP2
        LEFT JOIN (SELECT DISTINCT ON (rank_id, product_id) rank_id, product_id, price
                    FROM products_ranked_prices WHERE date <= $1
                    ORDER BY rank_id, product_id, date DESC
                    ) AS PRP on PRP.product_id = PCP2.id
        GROUP BY PCP2.id, PCP2.name, PCP2.image, PCP2.description,
                 PCP2.hidden, PCP2.deleted, PCP2.cost_price, PCP2.stock,
                 PCP2.threshold, PCP2.fixed_threshold, PCP2.menu_price
        ORDER BY PCP2.id;`;
    const {
        rows
    } = await db_init.getPool().query(queryText, [checkdate]);
    // logger.debug(rows)
    const products = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const product = new Product();
            product._id = row.id;
            product.name = row.name;
            product.image = row.image;
            product.stock = row.stock;
            product.description = row.description;
            product.threshold = row.threshold;
            product.fixed_threshold = row.fixed_threshold;
            product.hidden = row.hidden;
            product.deleted = row.deleted;

            product.roles_prices = row.roles_prices;
            product.menu_price = row.menu_price;
            product.cost_price = row.cost_price;

            products.push(product);
        }
    });

    return products;
}

/**
 * Get a product from the database. You just need to set his _id in the parameter.
 * Prices at the given datetime.
 * @param {Product} askedProduct
 * @param {Date} [datetime]
 * @returns {Promise<Product>}
 */
async function getProduct(askedProduct, datetime) {
    if (!(askedProduct instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't search for product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for product in database.");
    }
    if (!askedProduct._id) {
        throw new Error("Product id undefined: can't search for product in database.");
    }

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const queryText = `SELECT PCP2.*,
        COALESCE(json_object_agg(PRP.rank_id, PRP.price) 
                    FILTER (WHERE PRP.rank_id IS NOT NULL), '{}')::jsonb as roles_prices
        
        FROM (SELECT P.*, COALESCE(PCP.price, 0) as cost_price, COALESCE(PMP.price, 0) as menu_price 
                FROM products P
                LEFT JOIN (SELECT DISTINCT ON (product_id) product_id, price 
                        FROM products_cost_prices WHERE date <= $1
                        ORDER BY product_id, date DESC
                        ) PCP on PCP.product_id = P.id
                LEFT JOIN (SELECT DISTINCT ON (product_id) product_id, price 
                        FROM products_menu_prices WHERE date <= $1
                        ORDER BY product_id, date DESC
                        ) PMP on PMP.product_id = P.id
                WHERE P.id = $2
            ) AS PCP2
        LEFT JOIN (SELECT DISTINCT ON (rank_id, product_id) rank_id, product_id, price
                    FROM products_ranked_prices WHERE date <= $1
                    ORDER BY rank_id, product_id, date DESC
                    ) AS PRP on PRP.product_id = PCP2.id
        GROUP BY PCP2.id, PCP2.name, PCP2.image, PCP2.description,
                 PCP2.hidden, PCP2.deleted, PCP2.cost_price, PCP2.stock,
                 PCP2.threshold, PCP2.fixed_threshold, PCP2.menu_price
        ORDER BY PCP2.id;`;

    const {
        rows
    } = await db_init.getPool().query(queryText, [checkdate, askedProduct._id]);
    // logger.debug(rows)

    if (rows[0].id !== null) {
        const product = new Product();
        product._id = rows[0].id;
        product.name = rows[0].name;
        product.image = rows[0].image;
        product.stock = rows[0].stock;
        product.description = rows[0].description;
        product.threshold = rows[0].threshold;
        product.fixed_threshold = rows[0].fixed_threshold;
        product.hidden = rows[0].hidden;
        product.deleted = rows[0].deleted;

        product.roles_prices = rows[0].roles_prices;
        product.menu_price = rows[0].menu_price;
        product.cost_price = rows[0].cost_price;
        // logger.debug("Finished Product ", askedProduct._id);

        return product;
    }
    return undefined;
}

/**
 * Add or Update a product. Don't take into account the password. It will not add transactions anywhere.
 *
 * return the product added.
 * @param {Product} product
 * @returns {Promise<Product>}
 */
async function addOrUpdateProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't add or update.");
    }
    if (!product._id || !await productExists(product)) {
        return addProduct(product);
    }
    return updateProduct(product);
}

/**
 * Add a product. Don't take into account the password. It will not add transactions anywhere.
 * Product's prices will be added.
 *
 * Return the product added.
 * @param {Product} product
 * @returns {Promise<Product>}
 */
async function addProduct(product, client) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't add product to database.");
    }
    if (product._id && await productExists(product)) {
        logger.warn("You are adding a product with a valid id to the database:", product);
    }
    const client_u = await db_init.getPool().connect();
    try {
        if (!client) {
            await client_u.query('BEGIN');
        }

        const queryText = "INSERT INTO products (name, "
                                            + "image, "
                                            + "stock, "
                                            + "description, "
                                            + "threshold, "
                                            + "fixed_threshold, "
                                            + "hidden, "
                                            + "deleted) "
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;";

        const params = [
            product.name,
            product.image,
            product.stock,
            product.description,
            product.threshold,
            product.fixed_threshold,
            product.hidden,
            product.deleted
        ];

        const res = await client_u.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        product._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (product.roles_prices) {
            Object.keys(product.roles_prices).forEach((role_id) => {
                const role_temp = new Role();
                role_temp._id = parseInt(role_id);
                promises.push(
                    setRankedPrice(product, role_temp,
                        product.roles_prices[role_id], new Date(), client_u)
                );
            });
        }

        if (product.cost_price) {
            promises.push(
                setCostPrice(product, product.cost_price, new Date(), client_u)
            );
        }

        if (product.menu_price) {
            promises.push(
                setMenuPrice(product, product.menu_price, new Date(), client_u)
            );
        }

        await Promise.all(promises);
        if (!client) {
            await client_u.query('COMMIT');
        }

        return product;
    }
    catch (e) {
        if (!client) {
            await client_u.query('ROLLBACK');
        }
        throw e;
    }
    finally {
        if (!client) {
            client_u.release();
        }
    }
}

/**
 * Update a product.
 * Product's prices will be added.
 *
 * Return the product updated.
 * @param {Product} product
 * @returns {Promise<Product>}
 */
async function updateProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't update product in database.");
    }
    if (!product._id) {
        throw new Error("Product id was undefined: can't update product.");
    }
    if (!await productExists(product)) {
        throw new Error("Product doesn't exist in the database: can't update it.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM products WHERE id = $1;", [product._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Product id was not found in database: can't update product.");
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "UPDATE products SET name = $1, "
                                            + "image = $2, "
                                            + "stock = $3, "
                                            + "description = $4, "
                                            + "threshold = $5, "
                                            + "fixed_threshold = $6, "
                                            + "hidden = $7, "
                                            + "deleted = $8 "
        + "WHERE id = $9;";

        const params = [
            product.name,
            product.image,
            product.stock,
            product.description,
            product.threshold,
            product.fixed_threshold,
            product.hidden,
            product.deleted,
            product._id
        ];

        await client.query(queryText, params);

        const promises = []; // array of promises to know when everything is done.

        if (product.roles_prices) {
            Object.keys(product.roles_prices).forEach((role_id) => {
                const role_temp = new Role();
                role_temp._id = parseInt(role_id);
                promises.push(
                    setRankedPrice(product, role_temp,
                        product.roles_prices[role_id], new Date(), client)
                );
            });
        }

        if (product.cost_price) {
            promises.push(
                setCostPrice(product, product.cost_price, new Date(), client)
            );
        }

        if (product.menu_price) {
            promises.push(
                setMenuPrice(product, product.menu_price, new Date(), client)
            );
        }

        await Promise.all(promises);

        await client.query('COMMIT');

        return product;
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
 * Return prices of a product based on role at a choosen time in key/value: role_id:price.
 * @param {Product} product
 * @param {Date} [datetime]
 * @returns {Promise<Object.<number,price:number>>} role_id:price
*/
async function getRankedPrices(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get roles prices for product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't get roles prices for product in database.");
    }
    if (!await productExists(product)) {
        throw new Error("Product doesn't exist in the database: can't get its ranked price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT DISTINCT ON (rank_id) rank_id, price, date FROM products_ranked_prices "
                    + "WHERE product_id = $1 AND date <= $2 "
                    + "ORDER BY rank_id, date DESC;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [product._id, checkdate]);
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
 * Return price of a product in a menu at a choosen time. Return 0 if no price.
 * @param {Product} product
 * @param {Date} [datetime]
 * @returns {Promise<number>}
*/
async function getMenuPrice(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get menu price for product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of datetime type: can't get menu price for product in database.");
    }
    if (!await productExists(product)) {
        throw new Error("Product doesn't exist in the database: can't get its menu price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT price FROM products_menu_prices "
                    + "WHERE product_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC LIMIT 1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [product._id, checkdate]);
    // logger.debug(rows)

    if (rows[0] && rows[0].price !== null) {
        return rows[0].price;
    }
    return 0;
}

/**
 * Return cost price of a product at a choosen time. Return 0 if no price.
 * @param {Product} product
 * @param {Date} [datetime]
 * @returns {Promise<number>}
*/
async function getCostPrice(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get cost price for product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't get cost price for product in database.");
    }
    if (!await productExists(product)) {
        throw new Error("Product doesn't exist in the database: can't get its cost price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT price FROM products_cost_prices "
                    + "WHERE product_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC LIMIT 1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [product._id, checkdate]);
    // logger.debug(rows)
    if (rows[0] && rows[0].price !== null) {
        return rows[0].price;
    }
    return 0;
}

/**
 * Set the price of a product for a role at a choosen time.
 * @param {Product} product
 * @param {Rank} role
 * @param {number} cost
 * @param {Date} [datetime]
 * @param {PoolClient} [client]
*/
async function setRankedPrice(product, role, cost, datetime, client) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't change role price of product in database.");
    }
    if (!(typeof cost === 'number')) {
        throw new Error("Arg wasn't a number: can't change role price of product in database.");
    }
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't change role price of product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't change role price of product in database.");
    }
    if (!await productExists(product, client)) {
        throw new Error("Product doesn't exist in the database: can't change its ranked price.");
    }
    if (!await dbRole.roleExists(role, client)) {
        throw new Error("Role doesn't exist in database: can't change the related price of the product.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    let client_used = client;
    if (!client) {
        client_used = db_init.getPool();
    }

    const queryText = "INSERT INTO products_ranked_prices "
                        + "(product_id, "
                        + "rank_id, "
                        + "price, "
                        + "date) "
                        + "VALUES ($1, $2, $3, $4);";

    const params = [
        product._id,
        role._id,
        cost,
        checkdate
    ];

    await client_used.query(queryText, params);
}

/**
 * Set the price of a product for menus at a choosen time.
 * @param {Product} product
 * @param {number} cost
 * @param {Date} [datetime]
 * @param {PoolClient} [client]
*/
async function setMenuPrice(product, cost, datetime, client) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't change menu price of product in database.");
    }
    if (!(typeof cost === 'number')) {
        throw new Error("Arg wasn't a number: can't change menu price of product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't change menu price of product in database.");
    }
    if (!await productExists(product, client)) {
        throw new Error("Product doesn't exist in the database: can't change its menu price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    let client_used = client;
    if (!client) {
        client_used = db_init.getPool();
    }

    const queryText = "INSERT INTO products_menu_prices "
                        + "(product_id, "
                        + "price, "
                        + "date) "
                        + "VALUES ($1, $2, $3);";

    const params = [
        product._id,
        cost,
        checkdate
    ];

    await client_used.query(queryText, params);
}

/**
 * Set the cost price of a product at a choosen time.
 * @param {Product} product
 * @param {number} cost
 * @param {Date} [datetime]
 * @param {PoolClient} [client]
*/
async function setCostPrice(product, cost, datetime, client) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't change cost price of product in database.");
    }
    if (!(typeof cost === 'number')) {
        throw new Error("Arg wasn't a number: can't change cost price of product in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't change cost price of product in database.");
    }
    if (!await productExists(product, client)) {
        throw new Error("Product doesn't exist in the database: can't change its cost price.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    let client_used = client;
    if (!client) {
        client_used = db_init.getPool();
    }

    const queryText = "INSERT INTO products_cost_prices "
                        + "(product_id, "
                        + "price, "
                        + "date) "
                        + "VALUES ($1, $2, $3);";

    const params = [
        product._id,
        cost,
        checkdate
    ];

    await client_used.query(queryText, params);
}

/**
 * Check if Product exists using the id
 * @param {Product} product
 */
async function productExists(product, client) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't check for product in database.");
    }
    if (!product._id) {
        throw new Error("Product id was undefined: can't check for product in database.");
    }

    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(*) FROM products WHERE id = $1;", [product._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Remove totally a product.
 * @param {Product} product
 */
async function removeProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't remove product from database.");
    }
    if (!product._id) {
        throw new Error("Product id was undefined: can't remove product from database.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM products WHERE id = $1;", [product._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Product id was not found in database: can't remove product.");
    }

    await db_init.getPool().query("DELETE FROM products WHERE id = $1;", [product._id]);
}

// TODO: add getter and setter of price by rank settings, by menu settings and change functions to use them.

module.exports.getAllProducts = getAllProducts;
module.exports.addProduct = addProduct;
module.exports.removeProduct = removeProduct;
module.exports.productExists = productExists;
module.exports.updateProduct = updateProduct;
module.exports.addOrUpdateProduct = addOrUpdateProduct;
module.exports.getProduct = getProduct;
module.exports.getRankedPrices = getRankedPrices;
module.exports.getMenuPrice = getMenuPrice;
module.exports.getCostPrice = getCostPrice;
module.exports.setRankedPrice = setRankedPrice;
module.exports.setMenuPrice = setMenuPrice;
module.exports.setCostPrice = setCostPrice;
