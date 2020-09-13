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
async function getRankedPrices(product, datetime) { // TODO: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
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
async function getMenuPrice(product, datetime) { // TODO: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
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
 * Add a product. Don't take into account the password. It will not add transactions anywhere.
 * return the product added.
 * @param {Product} product
 * @returns {Product}
 */
async function addOrUpdateProduct(product) {
    if (!product) {
        throw new Error("Product was undefined: can't add product.");
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
 * return the product added.
 * @param {Product} product
 * @returns {Product}
 */
async function addProduct(product) { // TODO: THIS ENTIRE FUCKING FUNCTION and all the functions of the file
    if (!product) {
        throw new Error("Product was undefined: can't add product.");
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO products (first_name, "
                                            + "last_name, "
                                            + "solde, "
                                            + "points, "
                                            + "pseudo, "
                                            + "email, "
                                            + "date_of_birth, "
                                            + "image, "
                                            + "last_logged, "
                                            + "active) "
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, date_of_birth;";

        const params = [
            product.first_name,
            product.last_name,
            product.solde,
            product.points,
            product.pseudo,
            product.email,
            product.date_of_birth,
            product.image,
            product.last_logged,
            product.active
        ];

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        product._id = res.rows[0].id;
        // eslint-disable-next-line no-param-reassign
        product.date_of_birth = res.rows[0].date_of_birth;

        const promises = []; // array of promises to know when everything is done.

        if (product.tags) {
            product.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (product_id, tag_id) VALUES ($1, $2)', [product._id, tag])
                );
            });
        }

        if (product.roles) {
            product.roles.forEach((role) => {
                promises.push(
                    client.query('INSERT INTO roles_to_products (product_id, role_id) VALUES ($1, $2)',
                        [product._id, role._id])
                );
            });
        }

        if (product.personnal_permissions) {
            product.personnal_permissions.forEach((the_perm) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_products (product_id, perm_id) VALUES ($1, $2)',
                        [product._id, the_perm._id])
                );
            });
        }

        if (product.favorites) {
            product.favorites.forEach((the_prod) => {
                promises.push(
                    client.query('INSERT INTO favorites (product_id, product_id, index) VALUES ($1, $2, $3)',
                        [product._id, the_prod._id, product.favorites.indexOf(the_prod)])
                );
            });
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
 * Update a product. Don't take intp account the password. It will not add transactions anywhere.
 * return the product updated.
 * @param {Product} product
 * @returns {Product}
 */
async function updateProduct(product) {
    if (!product) {
        throw new Error("Product was undefined: can't update product.");
    }
    if (!product._id) {
        throw new Error("Product id was undefined: can't update product.");
    }
    const counting = await pool.query("SELECT COUNT(id) FROM products WHERE id = $1;", [product._id]);
    if (counting.rows.count === 0) {
        throw new Error("Product id was not found in database: can't update product.");
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = "UPDATE products SET first_name = $1, "
                                            + "last_name = $2, "
                                            + "solde = $3, "
                                            + "points = $4, "
                                            + "pseudo = $5, "
                                            + "email = $6, "
                                            + "date_of_birth = $7, "
                                            + "image = $8, "
                                            + "last_logged = $9, "
                                            + "active = $10 "
        + "WHERE id = $11;";

        const params = [
            product.first_name,
            product.last_name,
            product.solde,
            product.points,
            product.pseudo,
            product.email,
            product.date_of_birth,
            product.image,
            product.last_logged,
            product.active,
            product._id
        ];

        await client.query(queryText, params);

        const promises = []; // array of promises to know when everything is done.

        client.query("DELETE FROM tags WHERE product_id = $1;", [product._id]);
        if (product.tags) {
            product.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (product_id, tag_id) VALUES ($1, $2)', [product._id, tag])
                );
            });
        }

        client.query("DELETE FROM roles_to_products WHERE product_id = $1;", [product._id]);
        if (product.roles) {
            product.roles.forEach((role) => {
                promises.push(
                    client.query('INSERT INTO roles_to_products (product_id, role_id) VALUES ($1, $2)',
                        [product._id, role._id])
                );
            });
        }

        client.query("DELETE FROM permissions_to_products WHERE product_id = $1;", [product._id]);
        if (product.personnal_permissions) {
            product.personnal_permissions.forEach((the_perm) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_products (product_id, perm_id) VALUES ($1, $2)',
                        [product._id, the_perm._id])
                );
            });
        }

        client.query("DELETE FROM favorites WHERE product_id = $1;", [product._id]);
        if (product.favorites) {
            product.favorites.forEach((the_prod) => {
                promises.push(
                    client.query('INSERT INTO favorites (product_id, product_id, index) VALUES ($1, $2, $3)',
                        [product._id, the_prod._id, product.favorites.indexOf(the_prod)])
                );
            });
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
 * Remove a product
 * @param {Product} product
 */
async function removeProduct(product) {
    if (!product) {
        throw new Error("Product was undefined: can't remove product from database.");
    }

    await pool.query("DELETE FROM products WHERE id = $1;", [product._id]);
}

// TODO: add price by rank, by menu, cost price.

module.exports.getAllProducts = getAllProducts;
module.exports.addProduct = addProduct;
module.exports.removeProduct = removeProduct;
module.exports.updateProduct = updateProduct;
module.exports.addOrUpdateProduct = addOrUpdateProduct;
module.exports.getProduct = getProduct;
module.exports.getRankedPrices = getRankedPrices;
module.exports.getMenuPrice = getMenuPrice;
module.exports.getCostprice = getCostprice;
