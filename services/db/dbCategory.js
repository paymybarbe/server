const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbCategory"
// });
const dbProduct = require("./dbProduct");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const logger = require("../logger").child({
    service: "server:services:db:dbCategory"
});

/**
 * Get all categories from the database.
 * @returns {Promise<Category[]>}
 */
async function getAllCategories() {
    const queryText = "SELECT * FROM categories P;";
    const {
        rows
    } = await db_init.getPool().query(queryText);
    //
    const categories = [];
    let promises = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const category = new Category();
            category._id = row.id;
            category.name = row.name;
            category.image = row.image;
            category.description = row.description;
            category.hidden = row.hidden;
            category.index = row.index;
            promises.push(getProductsFromCategory(category));

            categories.push(category);
        }
    });

    promises = await Promise.all(promises);

    for (let i = 0; i < categories.length; i++) {
        categories[i].products = promises[i];
    }
    return categories;
}

/**
 * Get a category from the database. You just need to set his _id in the parameter.
 * @param {Category} askedCategory
 * @returns {Promise<Category>}
 */
async function getCategory(askedCategory) {
    if (!(askedCategory instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't search for category in database.");
    }
    if (!askedCategory._id) {
        throw new Error("Category id undefined: can't search for category in database.");
    }
    const queryText = "SELECT * FROM categories P WHERE id = $1;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [askedCategory._id]);
    //

    if (rows[0].id !== null) {
        const category = new Category();
        category._id = rows[0].id;
        category.name = rows[0].name;
        category.image = rows[0].image;
        category.description = rows[0].description;
        category.hidden = rows[0].hidden;
        category.index = rows[0].index;

        category.products = await getProductsFromCategory(category);

        return category;
    }
    return undefined;
}

/**
 * Get the products of a category from the database. You just need to set his _id in the parameter.
 * @param {Category} askedCategory
 * @returns {Promise<Products[]>}
 */
async function getProductsFromCategory(askedCategory, client) {
    if (!(askedCategory instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't search for category in database.");
    }
    if (!askedCategory._id) {
        throw new Error("Category id undefined: can't search for category in database.");
    }

    const client_u = client || await db_init.getPool();

    const queryText = "SELECT * FROM products_to_categories P WHERE category_id = $1;";

    const {
        rows
    } = await client_u.query(queryText, [askedCategory._id]);
    //

    let answ = [];

    rows.forEach((row) => {
        if (row.product_id !== null) {
            const product = new Product();
            product._id = row.product_id;
            answ.push(dbProduct.getProduct(product, client));
        }
    });

    answ = await Promise.all(answ);

    return answ;
}

/**
 * Add a category. Don't take into account the password.
 *
 * Return the category added.
 * @param {Category} category
 * @returns {Promise<Category>}
 */
async function addCategory(category, client) {
    if (!(category instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't add category to database.");
    }
    if (category._id && await categoryExists(category, client)) {
        logger.warn("You are adding a category with a valid id to the database:", category);
    }
    if (await categoryIndexExists(category, client)) {
        logger.error("You tried to add a category with an existing index to the database. Can't add the category.", category);
    }
    const client_u = client || await db_init.getPool().connect();
    try {
        if (!client) {
            await client_u.query('BEGIN');
        }

        const queryText = "INSERT INTO categories (name, "
                                            + "image, "
                                            + "description, "
                                            + "hidden, "
                                            + "index) "
        + "VALUES ($1, $2, $3, $4, $5) RETURNING id;";

        const params = [
            category.name,
            category.image,
            category.description,
            category.hidden,
            category.index
        ];

        const res = await client_u.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        category._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (category.products) {
            category.products.forEach((product) => {
                promises.push(
                    client_u.query('INSERT INTO products_to_categories (product_id, category_id) VALUES ($1, $2);',
                        [product._id, category._id])
                );
            });
        }

        await Promise.all(promises);
        if (!client) {
            await client_u.query('COMMIT');
        }

        return category;
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
 * Take an array of all categories and update or add them in database.
 * Categories existing but not specified will be deleted.
 * Return the categories updated.
 * @param {Category[]} category
 * @returns {Promise<Category[]>}
 */
async function updateCategories(categories) {
    const index_used = [];
    categories.forEach((category) => {
        if (!(category instanceof Category)) {
            throw new Error("Arg wasn't of Category type: can't update category in database.");
        }
        if (index_used.includes(category.index)) {
            throw new Error("There was two categories with same indexes ! Can't update categories in database !");
        }
        index_used.push(category.index);
    });

    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        // Set all indexes to their negative values to avoid conflict as it must be unique
        await client.query("UPDATE categories SET index = -index;");

        const updating_categories = []; // array of promises for categories being updated.
        let updated_categories = []; // Array of promises or categories.
        categories.forEach((category) => {
            if (!category._id) { // If category doesn't exist
                return;
            }

            // If category exist we update it
            const queryText = "UPDATE categories SET name = $1, "
                                                + "image = $2, "
                                                + "description = $3, "
                                                + "hidden = $4, "
                                                + "index = $5 "
            + "WHERE id = $6;";

            const params = [
                category.name,
                category.image,
                category.description,
                category.hidden,
                category.index,
                category._id
            ];

            updating_categories.push(client.query(queryText, params));
            updated_categories.push(category);
        });

        await Promise.all(updating_categories);

        updated_categories = await Promise.all(updated_categories);

        // Delete all products in all categories.
        await client.query("TRUNCATE products_to_categories;");

        // If indexes are negatives then we didn't update their category and they should be deleted.
        await client.query("DELETE FROM categories WHERE index < 0;");

        // Add products to their categories
        const promises = [];
        updated_categories.forEach((category) => {
            if (category.products) {
                category.products.forEach((product) => {
                    promises.push(
                        client.query('INSERT INTO products_to_categories (product_id, category_id) VALUES ($1, $2);',
                            [product._id, category._id])
                    );
                });
            }
        });

        await Promise.all(promises);

        categories.forEach((category) => {
            if (!category._id) { // If category didn't exist
                updated_categories.push(addCategory(category, client));
            }
        });

        updated_categories = await Promise.all(updated_categories);

        await client.query('COMMIT');

        return updated_categories;
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
 * Check if category exists using the id
 * @param {Category} category
 */
async function categoryExists(category, client) {
    if (!(category instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't check for category in database.");
    }
    if (!category._id) {
        throw new Error("Category id was undefined: can't check for category in database.");
    }

    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(*) FROM categories WHERE id = $1;", [category._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Check if category exists using the id
 * @param {Category} category
 */
async function categoryIndexExists(category, client) {
    if (!(category instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't check for category in database.");
    }
    if (!category._id) {
        return false;
    }

    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(*) FROM categories WHERE index = $1;", [category._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Remove totally a category.
 * @param {Category} category
 */
async function removeCategory(category) {
    if (!(category instanceof Category)) {
        throw new Error("Arg wasn't of Category type: can't remove category from database.");
    }
    if (!category._id) {
        throw new Error("Category id was undefined: can't remove category from database.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM categories WHERE id = $1;", [category._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Category id was not found in database: can't remove category.");
    }

    await db_init.getPool().query("DELETE FROM categories WHERE id = $1;", [category._id]);
}

module.exports.getAllCategories = getAllCategories;
module.exports.removeCategory = removeCategory;
module.exports.categoryExists = categoryExists;
module.exports.updateCategories = updateCategories;
module.exports.getCategory = getCategory;
