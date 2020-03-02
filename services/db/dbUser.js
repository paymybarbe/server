const db_init = require("./db_init");
const logger = require("../logger").child({
    service: "server:services:db:dbUser"
});
const User = require("../../models/User");
const Role = require("../../models/Role");
const Permission = require("../../models/Permission");
const pool = db_init.getPool();

/**
 * Get all users from the database.
 * @return {User[]}
 */
async function getAllUsers() { // TODO: THIS ENTIRE FUCKING FUNCTION
    const queryText = "SELECT users.*, array_agg(tags.tag_id) AS tags FROM users "
                    + "LEFT JOIN tags ON users.id = tags.user_id "
                    + "GROUP BY users.id, tags.user_id;";
    const {
        rows
    } = await pool.query(queryText);

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

            if (row.tags[0] === null) {
                user.tags = [];
            }
            else {
                user.tags = row.tags;
            }

            user.roles = getRolesFromUser(user);

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
 * Add a user. Do the work itself for the password. It will not add transactions anywhere.
 * return the user added.
 * @param {User} user
 * @returns {User}
 */
async function addUser(user) {
    if (!user) {
        logger.error("User was undefined: can't add user.");
        return undefined;
    }
    const user_ret = JSON.parse(JSON.stringify(user));
    const client = await pool.connect();
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
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;";

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
        user_ret._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (user.tags) {
            user.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (user_id, tag_id) VALUES ($1, $2)', [user_ret._id, tag])
                );
            });
        }

        if (user.roles) {
            user.roles.forEach((role) => {
                promises.push(
                    client.query('INSERT INTO roles_to_users (user_id, role_id) VALUES ($1, $2)', [user_ret._id, role._id])
                );
            });
        }
        // TODO: dbRole, completer cette fonction...

        await Promise.all(promises);
        await client.query('COMMIT');

        return user_ret;
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
 * Remove a user
 * @param {User} user
 */
async function removeUser(user) {
    if (!user) {
        throw new Error("User was undefined: can't remove user from database.");
    }

    await pool.query("DELETE FROM users WHERE id = $1;", [user._id]);
}

/**
 * Get all Roles from a User
 * @param User user
 * @returns {Role[]}
 */
async function getRolesFromUser(user) {
    const queryText = "SELECT roles.*, "
                        + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description]) AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "WHERE roles.id IN (SELECT role_id FROM roles_to_users WHERE user_id = $1) "
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await pool.query(queryText, [user._id]);

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

module.exports.getAllUsers = getAllUsers;
module.exports.addUser = addUser;
module.exports.removeUser = removeUser;
