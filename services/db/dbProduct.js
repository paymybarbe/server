const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbProduct"
// });
const Product = require("../../models/Product");
const pool = db_init.getPool();

/**
 * Get all products from the database.
 * @return {Product[]}
 */
async function getAllProducts() {
    const queryText = "SELECT * FROM products P;";
    const {
        rows
    } = await pool.query(queryText);
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

            product.roles_prices = getRankedPrices(product);
            product.menu_price = getMenuPrice(product);
            product.cost_price = getCostprice(product);

            products.push(product);
        }
    });

    for (let i = 0; i < products.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        products[i].roles_prices = await products[i].roles_prices;
        // eslint-disable-next-line no-await-in-loop
        products[i].menu_price = await products[i].menu_price;
        // eslint-disable-next-line no-await-in-loop
        products[i].cost_price = await products[i].cost_price;
    }
    return products;
}

/**
 * Return prices of a product based on rank at a choosen time in key/value: role_id:price.
 * @param {Product} product
 * @param {Date} datetime
 * @return {Object.<number,price:number>} role_id:price
*/
async function getRankedPrices(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get roles prices for product in database.");
    }
    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }
    const queryText = "SELECT DISTINCT ON (rank) rank, price FROM products_ranked_prices "
                    + "WHERE product_id = $1 AND date <= $2 "
                    + "ORDER BY date DESC;";
    const {
        rows
    } = await pool.query(queryText, [product._id, checkdate]);
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
 * Return price of a product in a menu at a choosen time. Return -1 if no price.
 * @param {Product} product
 * @param {Date} datetime
 * @return {number}
*/
async function getMenuPrice(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get menu price for product in database.");
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
    } = await pool.query(queryText, [product._id, checkdate]);
    // logger.debug(rows)

    if (rows[0].price !== null) {
        return rows[0].price;
    }
    return -1;
}

/**
 * Return cost price of a product at a choosen time. Return -1 if no price.
 * @param {Product} product
 * @param {Date} datetime
 * @return {number}
*/
async function getCostprice(product, datetime) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't get cost price for product in database.");
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
    } = await pool.query(queryText, [product._id, checkdate]);
    // logger.debug(rows)
    if (rows[0].price !== null) {
        return rows[0].price;
    }
    return -1;
}

/**
 * Get a product from the database. You just need to set his _id in the parameter.
 * @param {Product} askedProduct
 * @return {Product}
 */
async function getProduct(askedProduct) {
    if (!(askedProduct instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't search for product in database.");
    }
    if (!askedProduct._id) {
        throw new Error("Product id undefined: can't search for product in database.");
    }
    const queryText = "SELECT * FROM products P WHERE id = $1;";
    const {
        rows
    } = await pool.query(queryText, [askedProduct._id]);
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

        product.roles_prices = getRankedPrices(product);
        product.menu_price = getMenuPrice(product);
        product.cost_price = getCostprice(product);
        product.roles_prices = await product.roles_prices;
        product.menu_price = await product.menu_price;
        product.cost_price = await product.cost_price;

        return product;
    }
    return undefined;
}

/**
 * Add or Update a product. Don't take into account the password. It will not add transactions anywhere.
 * Product's prices are not changed.
 *
 * return the product added.
 * @param {Product} product
 * @returns {Product}
 */
async function addOrUpdateProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't add or update.");
    }
    if (!product._id) {
        await addProduct(product);
    }
    else {
        await updateProduct(product);
    }
}


/**
 * Add a product. Don't take into account the password. It will not add transactions anywhere.
 * Product's prices are not changed.
 *
 * Return the product added.
 * @param {Product} product
 * @returns {Product}
 */
async function addProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't add product to database.");
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

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

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        product._id = res.rows[0].id;

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
 * Update a product.
 * Product's prices are not changed.
 *
 * Return the product updated.
 * @param {Product} product
 * @returns {Product}
 */
async function updateProduct(product) {
    if (!(product instanceof Product)) {
        throw new Error("Arg wasn't of Product type: can't update product in database.");
    }
    if (!product._id) {
        throw new Error("Product id was undefined: can't update product.");
    }
    const counting = await pool.query("SELECT COUNT(id) FROM products WHERE id = $1;", [product._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Product id was not found in database: can't update product.");
    }
    const client = await pool.connect();
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
    const counting = await pool.query("SELECT COUNT(id) FROM products WHERE id = $1;", [product._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Product id was not found in database: can't remove product.");
    }

    await pool.query("DELETE FROM products WHERE id = $1;", [product._id]);
}

// TODO: add setter of price by rank, by menu, cost price.

// TODO: add getter and setter of price by rank settings, by menu settings.

module.exports.getAllProducts = getAllProducts;
module.exports.addProduct = addProduct;
module.exports.removeProduct = removeProduct;
module.exports.updateProduct = updateProduct;
module.exports.addOrUpdateProduct = addOrUpdateProduct;
module.exports.getProduct = getProduct;
module.exports.getRankedPrices = getRankedPrices;
module.exports.getMenuPrice = getMenuPrice;
module.exports.getCostprice = getCostprice;
