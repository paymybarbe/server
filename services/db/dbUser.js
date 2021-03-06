const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbUser"
// });
const User = require("../../models/User");
const Role = require("../../models/Role");
const Permission = require("../../models/Permission");
const logger = require("../logger");

/**
 * Get all users from the database.
 * @returns {Promise<User[]>}
 */
async function getAllUsers() {
    /* const queryText = "SELECT * FROM users LEFT JOIN "
        + "(SELECT tagged.id, tagged.tags,
            array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])
            as user_perms "
                + "FROM (SELECT users.id, array_agg(tags.tag_id) AS tags FROM users "
                + "LEFT JOIN tags ON users.id = tags.user_id "
                + "GROUP BY users.id, tags.user_id) AS tagged "
            + "LEFT JOIN permissions_to_users AS p_to_u ON p_to_u.user_id = tagged.id "
            + "LEFT JOIN permissions ON p_to_u.perm_id = permissions.id "
            + "GROUP BY tagged.id, tagged.tags) AS permed "
        + "ON users.id = permed.id;"; */

    const queryText = "SELECT u.*, array_agg(tags.tag_id) AS tags, "
                    + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                    + " as user_perms, "
                    + "array_agg(ARRAY[fav.index, fav.product_id]) as favorites "
                    + "FROM users u "
                    + "LEFT JOIN tags ON u.id = tags.user_id "
                    + "LEFT JOIN permissions_to_users AS p_to_u ON p_to_u.user_id = u.id "
                    + "LEFT JOIN permissions ON p_to_u.perm_id = permissions.id "
                    + "LEFT JOIN favorites fav ON u.id = fav.user_id "
                    + "GROUP BY u.id;";
    const {
        rows
    } = await db_init.getPool().query(queryText);
    // logger.debug(rows)
    const users = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const user = new User();
            user._id = row.id;
            user.first_name = row.first_name;
            user.last_name = row.last_name;
            user.solde = row.solde;
            user.points = row.points;
            user.pseudo = row.pseudo;
            user.email = row.email;
            user.date_of_birth = row.date_of_birth;
            user.created_at = row.created_at;
            user.active = row.active;
            user.last_logged = row.last_logged;

            if (row.tags[0] === null) {
                user.tags = [];
            }
            else {
                user.tags = row.tags;
            }

            user.roles = getRolesFromUser(user);

            user.personnal_permissions = [];
            if (row.user_perms) {
                row.user_perms.forEach((user_perm) => {
                    if (user_perm[0] !== null) {
                        const the_perm = new Permission();
                        the_perm._id = user_perm[0];
                        the_perm.permission = user_perm[1];
                        the_perm.description = user_perm[2];
                        user.personnal_permissions.push(the_perm);
                    }
                });
            }

            if (row.favorites[0] === null || row.favorites[0][0] === null) {
                user.favorites = [];
            }
            else {
                for (let ind = 0; ind < row.favorites.length; ind++) {
                    user.favorites[row.favorites[ind][0]] = row.favorites[ind][1];
                }
            }

            users.push(user);
        }
    });

    for (let i = 0; i < users.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        users[i].roles = await users[i].roles;
    }
    return users;
}

/**
 * Get a user from the database. You just need to set his _id.
 * @param {User} askedUser
 * @returns {Promise<User>}
 */
async function getUser(askedUser) {
    if (!(askedUser instanceof User)) {
        throw new Error("Arg wasn't of User type: can't get user from database.");
    }
    if (!askedUser._id) {
        throw new Error("User id was undefined: can't get user from database.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM users WHERE id = $1;", [askedUser._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("User id was not found in database: can't update user.");
    }

    const queryText = "SELECT u.*, array_agg(tags.tag_id) AS tags, "
                    + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                    + " as user_perms, "
                    + "array_agg(ARRAY[fav.index, fav.product_id]) as favorites "
                    + "FROM users u "
                    + "LEFT JOIN tags ON u.id = tags.user_id "
                    + "LEFT JOIN permissions_to_users AS p_to_u ON p_to_u.user_id = u.id "
                    + "LEFT JOIN permissions ON p_to_u.perm_id = permissions.id "
                    + "LEFT JOIN favorites fav ON u.id = fav.user_id "
                    + "WHERE u.id = $1 "
                    + "GROUP BY u.id;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [askedUser._id]);
    // logger.debug(rows)
    const users = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const user = new User();
            user._id = row.id;
            user.first_name = row.first_name;
            user.last_name = row.last_name;
            user.solde = row.solde;
            user.points = row.points;
            user.pseudo = row.pseudo;
            user.email = row.email;
            user.date_of_birth = row.date_of_birth;
            user.created_at = row.created_at;
            user.active = row.active;
            user.image = row.image;
            user.last_logged = row.last_logged;

            if (row.tags[0] === null) {
                user.tags = [];
            }
            else {
                user.tags = row.tags;
            }

            user.roles = getRolesFromUser(user);

            user.personnal_permissions = [];
            if (row.user_perms) {
                row.user_perms.forEach((user_perm) => {
                    if (user_perm[0] !== null) {
                        const the_perm = new Permission();
                        the_perm._id = user_perm[0];
                        the_perm.permission = user_perm[1];
                        the_perm.description = user_perm[2];
                        user.personnal_permissions.push(the_perm);
                    }
                });
            }

            if (row.favorites[0] === null || row.favorites[0][0] === null) {
                user.favorites = [];
            }
            else { // FIXME: Add Product to favorites ?
                for (let ind = 0; ind < row.favorites.length; ind++) {
                    user.favorites[row.favorites[ind][0]] = row.favorites[ind][1];
                }
            }

            users.push(user);
        }
    });

    for (let i = 0; i < users.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        users[i].roles = await users[i].roles;
    }
    return users[0];
}

/**
 * Add a user. Don't take into account the password. It will not add transactions anywhere.
 * return the user added.
 * @param {User} user
 * @returns {Promise<User>}
 */
async function addOrUpdateUser(user) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't add/update user.");
    }
    if (!user._id || !await userExists(user)) {
        return addUser(user);
    }
    return updateUser(user);
}

/**
 * Add a user. Don't take into account the password. It will not add transactions anywhere.
 * return the user added.
 * @param {User} user
 * @returns {Promise<User>}
 */
async function addUser(user) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't add user to database.");
    }
    if (user._id && await userExists(user)) {
        logger.warn("You are adding a user with a valid id to the database:", user);
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO users (first_name, "
                                            + "last_name, "
                                            + "solde, "
                                            + "points, "
                                            + "pseudo, "
                                            + "email, "
                                            + "date_of_birth, "
                                            + "image, "
                                            + "last_logged, "
                                            + "active) "
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, created_at;";

        const params = [
            user.first_name,
            user.last_name,
            user.solde,
            user.points,
            user.pseudo,
            user.email,
            user.date_of_birth,
            user.image,
            user.last_logged,
            user.active
        ];

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        user._id = res.rows[0].id;
        // eslint-disable-next-line no-param-reassign
        user.created_at = res.rows[0].created_at;

        const promises = []; // array of promises to know when everything is done.

        if (user.tags) {
            user.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (user_id, tag_id) VALUES ($1, $2)', [user._id, tag])
                );
            });
        }

        if (user.roles) {
            user.roles.forEach((role) => {
                promises.push(
                    client.query('INSERT INTO roles_to_users (user_id, role_id) VALUES ($1, $2)',
                        [user._id, role._id])
                );
            });
        }

        if (user.personnal_permissions) {
            user.personnal_permissions.forEach((the_perm) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_users (user_id, perm_id) VALUES ($1, $2)',
                        [user._id, the_perm._id])
                );
            });
        }

        if (user.favorites) {
            user.favorites.forEach((the_prod) => {
                promises.push(
                    client.query('INSERT INTO favorites (user_id, product_id, index) VALUES ($1, $2, $3)',
                        [user._id, the_prod._id, user.favorites.indexOf(the_prod)])
                );
            });
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return user;
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
 * Update a user. Don't take into account the password. It will not add transactions anywhere.
 * return the user updated.
 * @param {User} user
 * @returns {Promise<User>}
 */
async function updateUser(user) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't update user.");
    }
    if (!user._id) {
        throw new Error("User id was undefined: can't update user.");
    }
    if (!await userExists(user)) {
        throw new Error("User doesn't exist: can't update user.");
    }

    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const counting = await client.query("SELECT COUNT(id) FROM users WHERE id = $1;", [user._id]);
        if (Number(counting.rows[0].count) === 0) {
            throw new Error("User id was not found in database: can't update user.");
        }

        const queryText = "UPDATE users SET first_name = $1, "
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
            user.first_name,
            user.last_name,
            user.solde,
            user.points,
            user.pseudo,
            user.email,
            user.date_of_birth,
            user.image,
            user.last_logged,
            user.active,
            user._id
        ];

        await client.query(queryText, params);

        const promises = []; // array of promises to know when everything is done.

        await client.query("DELETE FROM tags WHERE user_id = $1;", [user._id]);
        await client.query("DELETE FROM roles_to_users WHERE user_id = $1;", [user._id]);
        await client.query("DELETE FROM permissions_to_users WHERE user_id = $1;", [user._id]);
        await client.query("DELETE FROM favorites WHERE user_id = $1;", [user._id]);
        if (user.tags) {
            user.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (user_id, tag_id) VALUES ($1, $2)', [user._id, tag])
                );
            });
        }
        if (user.roles) {
            user.roles.forEach((role) => {
                promises.push(
                    client.query('INSERT INTO roles_to_users (user_id, role_id) VALUES ($1, $2)',
                        [user._id, role._id])
                );
            });
        }

        if (user.personnal_permissions) {
            user.personnal_permissions.forEach((the_perm) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_users (user_id, perm_id) VALUES ($1, $2)',
                        [user._id, the_perm._id])
                );
            });
        }

        if (user.favorites) {
            user.favorites.forEach((the_prod) => {
                promises.push(
                    client.query('INSERT INTO favorites (user_id, product_id, index) VALUES ($1, $2, $3)',
                        [user._id, the_prod._id, user.favorites.indexOf(the_prod)])
                );
            });
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return user;
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
 * Remove totally a user.
 * @param {User} user
 */
async function removeUser(user) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't delete user from database.");
    }
    if (!user._id) {
        throw new Error("User id was undefined: can't remove user.");
    }
    if (!await userExists(user)) {
        throw new Error("User doesn't exist: can't remove user.");
    }
    const counting = await db_init.getPool().query("SELECT COUNT(id) FROM users WHERE id = $1;", [user._id]);
    if (Number(counting.rows[0].count) === 0) {
        throw new Error("User id was not found in database: can't remove user.");
    }

    await db_init.getPool().query("DELETE FROM users WHERE id = $1;", [user._id]);
}

/**
 * Check if user exist.
 * @param {User} user
 */
async function userExists(user, client) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't delete user from database.");
    }
    if (!user._id) {
        throw new Error("User id was undefined: can't remove user.");
    }
    const client_u = client || db_init.getPool();

    const answ = await client_u.query("SELECT COUNT(id) FROM users WHERE id = $1;", [user._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }

    return false;
}

/**
 * Get all Roles from a User
 * @param User user
 * @returns {Promise<Role[]>}
 */
async function getRolesFromUser(user) {
    if (!(user instanceof User)) {
        throw new Error("Arg wasn't of User type: can't get roles of user from database.");
    }
    if (!user._id) {
        throw new Error("User id was undefined: can't get user's permissions");
    }
    if (!await userExists(user)) {
        throw new Error("User doesn't exist: can't get user's permissions.");
    }
    const queryText = "SELECT roles.*, "
                        + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                        + " AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "WHERE roles.id IN (SELECT role_id FROM roles_to_users WHERE user_id = $1) "
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [user._id]);

    const roles = [];
    rows.forEach((row) => {
        if (row.id !== null) {
            const role = new Role();
            role._id = row.id;
            role.next_role = row.next_role;
            role.name = row.name;
            role.parent_role = row.parent_role;

            role.permissions = [];

            row.perm_array.forEach((arr) => {
                if (arr[0] !== null) {
                    const perm = new Permission();
                    perm._id = parseInt(arr[0]);
                    perm.permission = arr[1];
                    perm.description = arr[2];
                    role.permissions.push(perm);
                }
            });

            roles.push(role);
        }
    });
    return roles;
}

// TODO: function to change password, function to check login

module.exports.getAllUsers = getAllUsers;
module.exports.addUser = addUser;
module.exports.removeUser = removeUser;
module.exports.updateUser = updateUser;
module.exports.addOrUpdateUser = addOrUpdateUser;
module.exports.getUser = getUser;
module.exports.userExists = userExists;
