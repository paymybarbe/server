// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require("faker");
const logger = require("../services/logger").child({
    service: "server:scripts:seeder"
});
const config = require("../config/config");
const User = require("../models/User");
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const Product = require("../models/Product");
const Dish = require("../models/Dish");
const Category = require("../models/Category");
const Menu = require("../models/Menu");

const db_init = require("../services/db/db_init");

const dbUser = require("../services/db/dbUser");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");
const dbProduct = require("../services/db/dbProduct");
const dbDish = require("../services/db/dbDish");
const dbCategory = require("../services/db/dbCategory");
const dbMenu = require("../services/db/dbMenu");

async function cleanDB() {
    await db_init.migrate('0');
    await db_init.migrate();
}

async function generatePermissions(amount, permissions) {
    const permission_added = [];
    const name_used = [];
    if (permissions) {
        permissions.forEach((element) => {
            name_used.push(element.permission);
        });
    }
    for (let i = 0; i < amount; i++) {
        const permission = new Permission();
        permission.permission = faker.random.word();

        let j = 0;
        while (name_used.includes(permission.permission) && j < 20) {
            permission.permission = faker.random.word();
            j++;
        }
        if (j >= 20) {
            continue;
        }

        permission.description = faker.lorem.sentence();
        name_used.push(permission.permission);
        permission_added.push(permission);
    }
    return permission_added;
}

async function addPermissions(amount, permissions) {
    const permission_added = [];
    const perms = await generatePermissions(amount, permissions);
    perms.forEach((perm) => permission_added.push(dbPermission.addPermission(perm)));

    for (let i = 0; i < permission_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        permission_added[i] = await permission_added[i];
    }

    return permission_added;
}

async function generateRoles(amount, permissions, roles) {
    const role_added = [];
    const roles_used = [];
    if (roles) {
        roles.forEach((element) => {
            roles_used.push(element.name);
        });
    }
    for (let i = 0; i < amount; i++) {
        const role = new Role();
        role.name = faker.name.jobTitle();
        let j = 0;
        while (roles_used.includes(role.name) && j < 20) {
            role.name = faker.name.jobTitle();
            j++;
        }
        if (j >= 20) {
            continue;
        }
        if (roles && roles.length > 0) {
            role.parent_role = Math.random() > 0.3
                ? roles[Math.floor(Math.random() * roles.length)]._id : null;
            role.next_role = Math.random() > 0.3
                ? roles[Math.floor(Math.random() * roles.length)]._id : null;
        }

        role.permissions = [];
        if (permissions && permissions.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_perm = permissions[Math.floor(Math.random() * permissions.length)];
                if (role.permissions.filter(
                    (perm) => perm.permission === the_perm.permission
                ).length === 0) {
                    role.permissions.push(the_perm);
                }
            }
        }
        role_added.push(role);
        roles_used.push(role.name);
    }
    return role_added;
}

async function addRoles(amount, permissions, roles) {
    const role_added = [];

    const rolling = await generateRoles(amount, permissions, roles);
    rolling.forEach((roller) => role_added.push(dbRole.addRole(roller)));

    for (let i = 0; i < role_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        role_added[i] = await role_added[i];
    }

    return role_added;
}

async function generateProducts(amount, roles) {
    const product_adding = [];

    for (let i = 0; i < amount; i++) {
        const the_product = new Product();
        the_product.name = faker.commerce.productName();
        the_product.stock = Math.round(Math.random() * 1000);
        the_product.description = faker.commerce.productDescription();
        the_product.threshold = Math.floor(Math.random() * 101);
        the_product.fixed_threshold = Math.random() > 0.3;
        the_product.hidden = Math.random() > 0.3;
        the_product.deleted = Math.random() > 0.3;

        the_product.cost_price = Math.round(Math.random() * 10100) / 100;
        the_product.menu_price = Math.round(Math.random() * 10100) / 100;

        if (roles.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_role = roles[Math.floor(Math.random() * roles.length)];
                the_product.setRolePrice(the_role, Math.round(Math.random() * 10100) / 100);
            }
        }

        product_adding.push(the_product);
    }
    return product_adding;
}

async function addProducts(amount, roles) {
    const product_added = [];
    const productings = await generateProducts(amount, roles);
    // logger.debug(productings);
    productings.forEach((product) => product_added.push(dbProduct.addProduct(product)));

    for (let i = 0; i < product_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        product_added[i] = await product_added[i];
    }
    // logger.debug(product_added);

    return product_added;
}

async function generateDishes(amount, roles) {
    const dish_adding = [];

    for (let i = 0; i < amount; i++) {
        const the_dish = new Dish();
        the_dish.name = faker.commerce.productName();
        the_dish.description = faker.commerce.productDescription();
        the_dish.hidden = Math.random() > 0.3;
        the_dish.deleted = Math.random() > 0.3;

        the_dish.cost_price = Math.round(Math.random() * 10100) / 100;

        if (roles.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_role = roles[Math.floor(Math.random() * roles.length)];
                the_dish.setRolePrice(the_role, Math.round(Math.random() * 10100) / 100);
            }
        }

        const opt_used = [];

        for (let j = 0; j < 6; j++) {
            const opt = {};
            opt.name = faker.commerce.productAdjective();
            if (!opt_used.includes(opt.name)) {
                opt.price_change = Math.round(Math.random() * 1000) / 100 - Math.round(Math.random() * 1000) / 100;
                the_dish.options.push(opt);
                opt_used.push(opt.name);
            }
        }

        // FIXME: Add ingredients
        dish_adding.push(the_dish);
    }
    return dish_adding;
}

async function addDishes(amount, roles) {
    const dish_added = [];
    const dishings = await generateDishes(amount, roles);
    // logger.debug(dishings);
    dishings.forEach((dish) => dish_added.push(dbDish.addDish(dish)));

    for (let i = 0; i < dish_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        dish_added[i] = await dish_added[i];
    }
    // logger.debug(dish_added);

    return dish_added;
}

async function generateCategories(amount, products, categories) {
    const category_adding = [];
    const origin_len = categories ? categories.length : 0;

    for (let i = 0; i < amount; i++) {
        const the_category = new Category();
        the_category.name = faker.name.jobType();
        the_category.description = faker.commerce.productDescription();
        the_category.hidden = Math.random() > 0.3;
        the_category.index = i + origin_len;

        if (products && products.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 15); d++) {
                const the_product = products[Math.floor(Math.random() * products.length)];
                if (the_category.products.filter(
                    (prod) => prod._id === the_product._id
                ).length === 0) {
                    the_category.products.push(the_product);
                }
            }
        }
        category_adding.push(the_category);
    }
    return category_adding;
}

async function addCategories(amount, products, categories) {
    return dbCategory.updateCategories(await generateCategories(amount, products, categories));
}

async function generateMenus(amount, products, dishes, categories) {
    const menu_adding = [];

    for (let i = 0; i < amount; i++) {
        const the_menu = new Menu();
        the_menu.name = faker.commerce.productName();
        the_menu.description = faker.commerce.productDescription();
        the_menu.deleted = Math.random() > 0.3;

        for (let d = 0; d < Math.floor(Math.random() * 15); d++) {
            if (products && products.length > 0) {
                const the_product = products[Math.floor(Math.random() * products.length)];
                if (the_menu.content.filter(
                    (cont) => cont.product && the_product._id === cont.product._id
                ).length === 0) {
                    the_menu.addContent(the_product, Math.random() > 0.5);
                }
            }
            if (dishes && dishes.length > 0) {
                const the_dish = dishes[Math.floor(Math.random() * dishes.length)];
                if (the_menu.content.filter(
                    (cont) => cont.dish && the_dish._id === cont.dish._id
                ).length === 0) {
                    the_menu.addContent(the_dish, Math.random() > 0.5);
                }
            }
            if (categories && categories.length > 0) {
                const the_category = categories[Math.floor(Math.random() * categories.length)];
                if (the_menu.content.filter(
                    (cont) => cont.category && the_category._id === cont.category._id
                ).length === 0) {
                    the_menu.addContent(the_category, Math.random() > 0.5);
                }
            }
        }

        menu_adding.push(the_menu);
    }
    return menu_adding;
}

async function addMenus(amount, products, dishes, categories) {
    const menu_added = [];
    const menuings = await generateMenus(amount, products, dishes, categories);
    // logger.debug(menuings);
    menuings.forEach((menu) => menu_added.push(dbMenu.addMenu(menu)));

    for (let i = 0; i < menu_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        menu_added[i] = await menu_added[i];
    }
    // logger.debug(menu_added);

    return menu_added;
}

async function generateUsers(amount, permissions, roles, products) {
    const user_adding = [];

    for (let i = 0; i < amount; i++) {
        const the_user = new User();
        the_user.first_name = faker.name.firstName();
        the_user.last_name = faker.name.lastName();
        the_user.solde = Math.round(Math.random() * 10100) / 100;
        the_user.points = Math.floor(Math.random() * 101);
        the_user.pseudo = faker.internet.userName();
        the_user.email = faker.internet.email();
        the_user.date_of_birth = faker.date.past();
        the_user.date_of_birth.setHours(0, 0, 0, 0);
        the_user.created_at = faker.date.recent();
        the_user.created_at.setHours(0, 0, 0, 0);
        the_user.active = Math.random() > 0.5;

        the_user.tags = [];
        for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
            the_user.tags.push(faker.random.alphaNumeric(32));
        }

        the_user.roles = [];

        if (roles.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_role = roles[Math.floor(Math.random() * roles.length)];
                if (the_user.roles.filter(
                    (role) => role._id === the_role._id
                ).length === 0) {
                    the_user.roles.push(the_role);
                }
            }
        }

        the_user.personnal_permissions = [];
        if (permissions.length !== 0) {
            for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
                const that_perm = permissions[Math.floor(Math.random() * permissions.length)];
                if (!the_user.personnal_permissions.includes(that_perm)) {
                    the_user.personnal_permissions.push();
                }
            }
        }

        the_user.favorites = [];
        if (products && products.length !== 0) {
            for (let j = 0; j < Math.floor(Math.random() * 6); j++) {
                const that_product = permissions[Math.floor(Math.random() * products.length)];
                if (!the_user.favorites.includes(that_product)) {
                    the_user.favorites.push();
                }
            }
        }

        user_adding.push(the_user);
    }
    return user_adding;
}

async function addUsers(amount, permissions, roles, products) {
    const user_added = [];
    const userings = await generateUsers(amount, permissions, roles, products);
    // logger.debug(userings);
    userings.forEach((user) => user_added.push(dbUser.addUser(user)));

    for (let i = 0; i < user_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        user_added[i] = await user_added[i];
    }
    // logger.debug(user_added);

    return user_added;
}

async function main() {
    let permissions = [];
    let roles = [];
    logger.debug(`Running on database ${config.database.database}`);
    const start = Date.now();
    let last_time = start;

    if (process.env.CLEAN) {
        try {
            await cleanDB();
            logger.debug(`Dumped & Recreated all tables in ${(Date.now() - start) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    try {
        permissions = await dbPermission.getAllPermissions();
    }
    catch (err) {
        logger.error("Error getting all permissions: ", err);
    }

    try {
        roles = await dbRole.getAllRoles();
    }
    catch (err) {
        logger.error("Error getting all roles: ", err);
    }

    last_time = Date.now();

    if (process.env.PERMISSIONS) {
        try {
            const added_permissions = await addPermissions(process.env.PERMISSIONS, permissions);
            permissions = [...permissions, ...added_permissions];
            logger.debug(`Finished seeding ${added_permissions.length} `
                    + `permissions in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    if (process.env.ROLES) {
        try {
            const role_added = await addRoles(process.env.ROLES, permissions, roles);
            roles = [...roles, ...role_added];
            logger.debug(`Finished seeding ${role_added.length} `
                    + `roles in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    if (process.env.USERS) {
        try {
            const user_adding = await addUsers(process.env.USERS, permissions, roles);

            logger.debug(`Finished seeding ${user_adding.length} users `
                        + `in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    await db_init.end().then(() => {
        const millis = Date.now() - start;
        logger.debug(`Seeding finished in ${Math.floor(millis / 10) / 100} seconds.`);
    }).catch((err) => logger.debug(err));
}

if (require.main === module) {
    main().then(() => {});
}

module.exports.generatePermissions = generatePermissions;
module.exports.addPermissions = addPermissions;
module.exports.generateRoles = generateRoles;
module.exports.addRoles = addRoles;
module.exports.generateProducts = generateProducts;
module.exports.addProducts = addProducts;
module.exports.generateCategories = generateCategories;
module.exports.addCategories = addCategories;
module.exports.generateMenus = generateMenus;
module.exports.addMenus = addMenus;
module.exports.generateDishes = generateDishes;
module.exports.addDishes = addDishes;
module.exports.generateUsers = generateUsers;
module.exports.addUsers = addUsers;
module.exports.cleanDB = cleanDB;
