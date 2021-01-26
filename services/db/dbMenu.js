const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbMenu"
// });
const Menu = require("../../models/Menu");
const Category = require("../../models/Category");
const dbCategory = require("./dbCategory");
const Product = require("../../models/Product");
const dbProduct = require("./dbProduct");
const Dish = require("../../models/Dish");
const dbDish = require("./dbDish");
const logger = require("../logger").child({
    service: "server:services:db:dbMenu"
});

function sortIndex(a, b) {
    return a.index - b.index;
}

/**
 * Get all menus from the database, prices at the given datetime.
 * @param {Date} [datetime]
 * @returns {Promise<Menu[]>}
 */
async function getAllMenus(datetime) {
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for menu in database.");
    }
    const queryText = "SELECT M.*, "
                    + "array_agg(DISTINCT ARRAY[PM.product_id, PM.index, PM.forced::INT]) as products, "
                    + "array_agg(DISTINCT ARRAY[DM.dish_id,    DM.index, DM.forced::INT]) as dishes, "
                    + "array_agg(DISTINCT ARRAY[CM.category_id, CM.index, CM.forced::INT]) as categories "
                    + "FROM menus M "
                    + "LEFT JOIN products_inside_menus   AS PM ON PM.menu_id = M.id "
                    + "LEFT JOIN dishes_inside_menus     AS DM ON DM.menu_id = M.id "
                    + "LEFT JOIN categories_inside_menus AS CM ON CM.menu_id = M.id "
                    + "GROUP BY M.id "
                    + "ORDER BY M.name;";
    const {
        rows
    } = await db_init.getPool().query(queryText);
    // logger.debug(rows)
    const menus = [];

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const promises = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const menu = new Menu();
            menu._id = row.id;
            menu.name = row.name;
            menu.image = row.image;
            menu.description = row.description;
            menu.deleted = row.deleted;

            menu.content = [];

            if (row.products[0] !== null && row.products[0][0] !== null) {
                row.products.forEach((prod) => {
                    menu.content.push({
                        product: prod[0],
                        forced: !!prod[2], // To convert int to boolean
                        index: prod[1]
                    });
                });
            }
            if (row.dishes[0] !== null && row.dishes[0][0] !== null) {
                row.dishes.forEach((dish) => {
                    menu.content.push({
                        dish: dish[0],
                        forced: !!dish[2], // To convert int to boolean
                        index: dish[1]
                    });
                });
            }
            if (row.categories[0] !== null && row.categories[0][0] !== null) {
                row.categories.forEach((cat) => {
                    menu.content.push({
                        category: cat[0],
                        forced: !!cat[2], // To convert int to boolean
                        index: cat[1]
                    });
                });
            }

            menu.content.sort(sortIndex);
            const proms = [];
            menu.content.forEach((cont) => {
                if (cont.product) {
                    const the_prod = new Product();
                    the_prod._id = cont.product;
                    proms.push(dbProduct.getProduct(the_prod, checkdate));
                }
                else if (cont.dish) {
                    const the_dish = new Dish();
                    the_dish._id = cont.dish;
                    proms.push(dbDish.getDish(the_dish, checkdate));
                }
                else if (cont.category) {
                    const the_cat = new Category();
                    the_cat._id = cont.category;
                    proms.push(dbCategory.getCategory(the_cat, checkdate));
                }
                else {
                    throw new Error("No good type for content in menu: can't retrieve all the menus.");
                }
                // eslint-disable-next-line no-param-reassign
                delete cont.index;
            });
            promises.push(Promise.all(proms));
            menus.push(menu);
        }
    });
    // logger.debug("waiting for array of array.");
    const all_content = await Promise.all(promises);

    for (let i = 0; i < all_content.length; i++) {
        for (let j = 0; j < all_content[i].length; j++) {
            if (menus[i].content[j].product) {
                menus[i].content[j].product = all_content[i][j];
            }
            else if (menus[i].content[j].dish) {
                menus[i].content[j].dish = all_content[i][j];
            }
            else if (menus[i].content[j].category) {
                menus[i].content[j].category = all_content[i][j];
            }
            else {
                throw new Error("No good type for choosing content in menu: can't retrieve all the menus.");
            }
        }
    }
    // logger.debug("Finished getting everything.");
    return menus;
}

/**
 * Get a menu from the database. You just need to set his _id in the parameter.
 * Prices at the given datetime.
 * @param {Menu} askedMenu
 * @param {Date} [datetime]
 * @returns {Promise<Menu>}
 */
async function getMenu(askedMenu, datetime) {
    if (!(askedMenu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't search for menu in database.");
    }
    if (datetime && !(datetime instanceof Date)) {
        throw new Error("Arg wasn't of Date type: can't search for menu in database.");
    }
    if (!askedMenu._id) {
        throw new Error("Menu id undefined: can't search for menu in database.");
    }
    const queryText = "SELECT M.*, "
                    + "array_agg(DISTINCT ARRAY[PM.product_id, PM.index, PM.forced::INT]) as products, "
                    + "array_agg(DISTINCT ARRAY[DM.dish_id,    DM.index, DM.forced::INT]) as dishes, "
                    + "array_agg(DISTINCT ARRAY[CM.category_id, CM.index, CM.forced::INT]) as categories "
                    + "FROM menus M "
                    + "LEFT JOIN products_inside_menus   AS PM ON PM.menu_id = M.id "
                    + "LEFT JOIN dishes_inside_menus     AS DM ON DM.menu_id = M.id "
                    + "LEFT JOIN categories_inside_menus AS CM ON CM.menu_id = M.id "
                    + "WHERE id=$1 "
                    + "GROUP BY M.id "
                    + "ORDER BY M.name;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [askedMenu._id]);
    // logger.debug(rows)
    const menus = [];

    let checkdate = datetime;
    if (!datetime) {
        checkdate = new Date();
    }

    const promises = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const menu = new Menu();
            menu._id = row.id;
            menu.name = row.name;
            menu.image = row.image;
            menu.description = row.description;
            menu.deleted = row.deleted;

            menu.content = [];

            if (row.products[0] !== null && row.products[0][0] !== null) {
                row.products.forEach((prod) => {
                    menu.content.push({
                        product: prod[0],
                        forced: !!prod[2], // To convert int to boolean
                        index: prod[1]
                    });
                });
            }
            if (row.dishes[0] !== null && row.dishes[0][0] !== null) {
                row.dishes.forEach((dish) => {
                    menu.content.push({
                        dish: dish[0],
                        forced: !!dish[2], // To convert int to boolean
                        index: dish[1]
                    });
                });
            }
            if (row.categories[0] !== null && row.categories[0][0] !== null) {
                row.categories.forEach((cat) => {
                    menu.content.push({
                        category: cat[0],
                        forced: !!cat[2], // To convert int to boolean
                        index: cat[1]
                    });
                });
            }

            menu.content.sort(sortIndex);
            const proms = [];
            menu.content.forEach((cont) => {
                if (cont.product) {
                    const the_prod = new Product();
                    the_prod._id = cont.product;
                    proms.push(dbProduct.getProduct(the_prod, checkdate));
                }
                else if (cont.dish) {
                    const the_dish = new Dish();
                    the_dish._id = cont.dish;
                    proms.push(dbDish.getDish(the_dish, checkdate));
                }
                else if (cont.category) {
                    const the_cat = new Category();
                    the_cat._id = cont.category;
                    proms.push(dbCategory.getCategory(the_cat, checkdate));
                }
                else {
                    throw new Error("No good type for content in menu: can't retrieve all the menus.");
                }
                // eslint-disable-next-line no-param-reassign
                delete cont.index;
            });
            promises.push(Promise.all(proms));
            menus.push(menu);
        }
    });

    const all_content = await Promise.all(promises);
    for (let i = 0; i < all_content.length; i++) {
        for (let j = 0; j < all_content[i].length; j++) {
            if (menus[i].content[j].product) {
                menus[i].content[j].product = all_content[i][j];
            }
            else if (menus[i].content[j].dish) {
                menus[i].content[j].dish = all_content[i][j];
            }
            else if (menus[i].content[j].category) {
                menus[i].content[j].category = all_content[i][j];
            }
            else {
                throw new Error("No good type for choosing content in menu: can't retrieve all the menus.");
            }
        }
    }

    return menus[0];
}

/**
 * Add or Update a menu. Don't take into account the password. It will not add transactions anywhere.
 *
 * return the menu added.
 * @param {Menu} menu
 * @returns {Promise<Menu>}
 */
async function addOrUpdateMenu(menu) {
    if (!(menu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't add or update.");
    }
    if (!menu._id || !await menuExists(menu)) {
        return addMenu(menu);
    }
    return updateMenu(menu);
}

/**
 * Add a menu. Don't take into account the password.
 *
 * Return the menu added.
 * @param {Menu} menu
 * @returns {Promise<Menu>}
 */
async function addMenu(menu) {
    if (!(menu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't add menu to database.");
    }
    if (menu._id && await menuExists(menu)) {
        logger.warn("You are adding a menu with a valid id to the database:", menu);
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO menus (name, "
                                            + "image, "
                                            + "description, "
                                            + "deleted) "
        + "VALUES ($1, $2, $3, $4) RETURNING id;";

        const params = [
            menu.name,
            menu.image,
            menu.description,
            menu.deleted
        ];

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        menu._id = res.rows[0].id;

        let promises = []; // array of promises to know when everything is done.

        if (menu.content) {
            menu.content.forEach((cont) => { // We check if every dishes/categories/products exist.
                if (cont.product) {
                    if (!(cont.product instanceof Product)) {
                        throw new Error("Content wasn't of Product type: can't add menu to database.");
                    }
                    promises.push(dbProduct.productExists(cont.product, client));
                }
                else if (cont.category) {
                    if (!(cont.category instanceof Category)) {
                        throw new Error("Content wasn't of Category type: can't add menu to database.");
                    }
                    promises.push(dbCategory.categoryExists(cont.category, client));
                }
                else if (cont.dish) {
                    if (!(cont.dish instanceof Dish)) {
                        throw new Error("Content wasn't of Dish type: can't add menu to database.");
                    }
                    promises.push(dbDish.dishExists(cont.dish, client));
                }
                else {
                    throw new Error("Menu got content that isn't a dish, product or category. Can't add menu in database.");
                }
            });
        }

        promises = await Promise.all(promises);
        for (let i = 0; i < promises.length; i++) {
            if (!promises[i]) { // If the result is false then the product/category/dish doesn't exist
                if (menu.content[i].product) {
                    throw new Error("Content was of Product type and didn't exist in database: can't add menu to database.", menu.content[i].product);
                }
                else if (menu.content[i].dish) {
                    throw new Error("Content was of Dish type and didn't exist in database: can't add menu to database.", menu.content[i].dish);
                }
                else if (menu.content[i].category) {
                    throw new Error("Content was of Category type and didn't exist in database: can't add menu to database.", menu.content[i].category);
                }
            }
        }

        promises = []; // Now we will truly add the content to the database.

        if (menu.content) {
            for (let i = 0; i < menu.content.length; i++) {
                if (menu.content[i].product) {
                    promises.push(
                        client.query('INSERT INTO products_inside_menus (menu_id, index, product_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].product._id, menu.content[i].forced])
                    );
                }
                else if (menu.content[i].dish) {
                    promises.push(
                        client.query('INSERT INTO dishes_inside_menus (menu_id, index, dish_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].dish._id, menu.content[i].forced])
                    );
                }
                else if (menu.content[i].category) {
                    promises.push(
                        client.query('INSERT INTO categories_inside_menus (menu_id, index, category_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].category._id, menu.content[i].forced])
                    );
                }
            }
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return menu;
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
 * Update a menu.
 *
 * Return the menu updated.
 * @param {Menu} menu
 * @returns {Promise<Menu>}
 */
async function updateMenu(menu) {
    if (!(menu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't update menu in database.");
    }
    if (!menu._id) {
        throw new Error("Menu id was undefined: can't update menu.");
    }
    if (!await menuExists(menu)) {
        throw new Error("Menu doesn't exist in the database: can't update it.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM menus WHERE id = $1;", [menu._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Menu id was not found in database: can't update menu.");
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "UPDATE menus SET name = $1, "
                                            + "image = $2, "
                                            + "description = $3, "
                                            + "deleted = $4 "
        + "WHERE id = $5;";

        const params = [
            menu.name,
            menu.image,
            menu.description,
            menu.deleted,
            menu._id
        ];

        await client.query(queryText, params);

        let promises = []; // array of promises to know when everything is done.

        if (menu.content) {
            menu.content.forEach((cont) => { // We check if every dishes/categories/products exist.
                if (cont.product) {
                    if (!(cont.product instanceof Product)) {
                        throw new Error("Content wasn't of Product type: can't add menu to database.");
                    }
                    promises.push(dbProduct.productExists(cont.product, client));
                }
                else if (cont.category) {
                    if (!(cont.category instanceof Category)) {
                        throw new Error("Content wasn't of Category type: can't add menu to database.");
                    }
                    promises.push(dbCategory.categoryExists(cont.category, client));
                }
                else if (cont.dish) {
                    if (!(cont.dish instanceof Dish)) {
                        throw new Error("Content wasn't of Dish type: can't add menu to database.");
                    }
                    promises.push(dbDish.dishExists(cont.dish, client));
                }
                else {
                    throw new Error("Menu got content that isn't a dish, product or category. Can't add menu in database.");
                }
            });
        }

        promises = await Promise.all(promises);
        for (let i = 0; i < promises.length; i++) {
            if (!promises[i]) { // If the result is false then the product/category/dish doesn't exist
                if (menu.content[i].product) {
                    throw new Error("Content was of Product type and didn't exist in database: can't add menu to database.", menu.content[i].product);
                }
                else if (menu.content[i].dish) {
                    throw new Error("Content was of Dish type and didn't exist in database: can't add menu to database.", menu.content[i].dish);
                }
                else if (menu.content[i].category) {
                    throw new Error("Content was of Category type and didn't exist in database: can't add menu to database.", menu.content[i].category);
                }
            }
        }

        promises = []; // Now we delete the content already existing in database.

        promises.push(client.query("DELETE FROM products_inside_menus WHERE menu_id = $1;", [menu._id]));
        promises.push(client.query("DELETE FROM dishes_inside_menus WHERE menu_id = $1;", [menu._id]));
        promises.push(client.query("DELETE FROM categories_inside_menus WHERE menu_id = $1;", [menu._id]));

        await Promise.all(promises);

        promises = []; // Now we will truly add the content to the database.

        if (menu.content) {
            for (let i = 0; i < menu.content.length; i++) {
                if (menu.content[i].product) {
                    promises.push(
                        client.query('INSERT INTO products_inside_menus (menu_id, index, product_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].product._id, menu.content[i].forced])
                    );
                }
                else if (menu.content[i].dish) {
                    promises.push(
                        client.query('INSERT INTO dishes_inside_menus (menu_id, index, dish_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].dish._id, menu.content[i].forced])
                    );
                }
                else if (menu.content[i].category) {
                    promises.push(
                        client.query('INSERT INTO categories_inside_menus (menu_id, index, category_id, forced) VALUES ($1, $2, $3, $4);',
                            [menu._id, i, menu.content[i].category._id, menu.content[i].forced])
                    );
                }
            }
        }

        await Promise.all(promises);

        await client.query('COMMIT');

        return menu;
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
 * Check if menu exists using the id
 * @param {Menu} menu
 */
async function menuExists(menu, client) {
    if (!(menu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't check for menu in database.");
    }
    if (!menu._id) {
        throw new Error("Menu id was undefined: can't check for menu in database.");
    }

    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(*) FROM menus WHERE id = $1;", [menu._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Remove totally a menu.
 * @param {Menu} menu
 */
async function removeMenu(menu) {
    if (!(menu instanceof Menu)) {
        throw new Error("Arg wasn't of Menu type: can't remove menu from database.");
    }
    if (!menu._id) {
        throw new Error("Menu id was undefined: can't remove menu from database.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM menus WHERE id = $1;", [menu._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("Menu id was not found in database: can't remove menu.");
    }

    await db_init.getPool().query("DELETE FROM menus WHERE id = $1;", [menu._id]);
}

module.exports.getAllMenus = getAllMenus;
module.exports.addMenu = addMenu;
module.exports.removeMenu = removeMenu;
module.exports.menuExists = menuExists;
module.exports.updateMenu = updateMenu;
module.exports.addOrUpdateMenu = addOrUpdateMenu;
module.exports.getMenu = getMenu;
