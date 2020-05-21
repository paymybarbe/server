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
    const queryText = "SELECT * FROM products;";
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

            products.push(product);
        }
    });

    // for (let i = 0; i < products.length; i++) {
    //     // eslint-disable-next-line no-await-in-loop
    //     products[i].roles = await products[i].roles;
    // }
    return products;
}

async function getPrices(date) { // TODO: THIS ENTIRE FUCKING FUNCTION and the following of the file
    return date;
}

/**
 * Get a product from the database. You just need to set his _id.
 * @param {Product} askedProduct
 * @return {Product}
 */
async function getProduct(askedProduct) {
    return askedProduct;
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
async function addProduct(product) {
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


module.exports.getAllProducts = getAllProducts;
module.exports.addProduct = addProduct;
module.exports.removeProduct = removeProduct;
module.exports.updateProduct = updateProduct;
module.exports.addOrUpdateProduct = addOrUpdateProduct;
module.exports.getProduct = getProduct;
module.exports.getPrices = getPrices;
