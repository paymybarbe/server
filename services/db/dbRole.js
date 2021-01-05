const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbRole"
// });

const Role = require("../../models/Role");
const Permission = require("../../models/Permission");
const logger = require("../logger");


/**
 * Get all roles from the database.
 * @returns {Promise<Role[]>}
 */
async function getAllRoles() {
    const queryText = "SELECT roles.*, "
                    + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                    + " AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await db_init.getPool().query(queryText);

    const roles = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].id !== null) {
            const role = new Role();
            role._id = rows[i].id;
            role.next_role = rows[i].next_role;
            role.name = rows[i].name;
            role.parent_role = rows[i].parent_role;

            role.permissions = [];

            rows[i].perm_array.forEach((arr) => {
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
    }

    return roles;
}

/**
 * Get a role from the database from it's ID.
 * @param {Role} role
 * @returns {Promise<Role>}
 */
async function getRole(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't get role from database.");
    }
    if (!await roleExists(role)) {
        throw new Error("Role given doesn't exist: can't get role from database.");
    }
    const queryText = "SELECT roles.*, "
                    + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                    + " AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "WHERE roles.id = $1 "
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [role._id]);

    const roles = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].id !== null) {
            const role_got = new Role();
            role_got._id = rows[i].id;
            role_got.next_role = rows[i].next_role;
            role_got.name = rows[i].name;
            role_got.parent_role = rows[i].parent_role;

            role_got.permissions = [];

            rows[i].perm_array.forEach((arr) => {
                if (arr[0] !== null) {
                    const perm = new Permission();
                    perm._id = parseInt(arr[0]);
                    perm.permission = arr[1];
                    perm.description = arr[2];
                    role_got.permissions.push(perm);
                }
            });

            roles.push(role_got);
        }
    }

    return roles[0];
}

/**
 * Add a role, return the role added
 * @param {Role} role
 * @returns {Promise<Role>}
 */
async function addRole(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg was not of Role type: can't add role to database.");
    }
    if (await roleNameExists(role)) {
        throw new Error("Role given already exists: can't add role to database.");
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO roles (name, "
                                            + "parent_role, "
                                            + "next_role) "
        + "VALUES ($1, $2, $3) RETURNING id;";

        const params = [
            role.name,
            role.parent_role,
            role.next_role
        ];

        const res = await client.query(queryText, params);
        // eslint-disable-next-line no-param-reassign
        role._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (role.permissions) {
            role.permissions.forEach((permission) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_roles (role_id, perm_id) VALUES ($1, $2)',
                        [role._id, permission._id])
                );
            });
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return role;
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
 * Update a role, return the role updated.
 * @param {Role} role
 * @returns {Promise<Role>}
 */
async function updateRole(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg was not of Role type: can't update role in database.");
    }
    if (!await roleExists(role)) {
        throw new Error("Role given doesn't exist: can't update role in database.");
    }
    const client = await db_init.getPool().connect();
    try {
        await client.query('BEGIN');

        const queryText = "UPDATE roles SET name = $1, "
        + "parent_role = $2, "
        + "next_role = $3 "
        + "WHERE id = $4;";

        const params = [
            role.name,
            role.parent_role,
            role.next_role,
            role._id
        ];

        await client.query(queryText, params);

        const promises = []; // array of promises to know when everything is done.
        await client.query("DELETE FROM permissions_to_roles WHERE role_id = $1;", [role._id]);
        if (role.permissions) {
            role.permissions.forEach((permission) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_roles (role_id, perm_id) VALUES ($1, $2)',
                        [role._id, permission._id])
                );
            });
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return role;
    }
    catch (e) {
        await client.query('ROLLBACK');
        logger.error(e);
        throw e;
    }
    finally {
        client.release();
    }
}

/**
 * Remove a role
 * @param {Role} role
 */
async function removeRole(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Permission type: can't check for permission in database.");
    }
    if (!await roleExists(role)) {
        throw new Error("Role given don't exist: can't remove role from database.");
    }

    await db_init.getPool().query("DELETE FROM roles WHERE id = $1;", [role._id]);
}

/**
 * Get all permissions from a role.
 * @param {Role} role
 * @returns {Promise<Permission[]>}
 */
async function getPermissionsFromRole(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't get role permissions.");
    }
    if (!role._id) {
        throw new Error("Role id was undefined: can't get role permissions.");
    }
    if (!await roleExists(role)) {
        throw new Error("Role given don't exist: can't get role permissions from database.");
    }
    const queryText = "SELECT "
                        + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                        + " AS perm_array "
                    + "FROM permissions_to_roles "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "WHERE permissions_to_roles.role_id = $1"
                    + "GROUP BY role_id;";
    const {
        rows
    } = await db_init.getPool().query(queryText, [role._id]);
    const perms_answ = [];

    if (rows.length > 1) {
        throw new Error("getPermissionsFromRole returned several rows");
    }

    if (rows.length === 0) {
        return perms_answ;
    }

    rows[0].perm_array.forEach((arr) => {
        if (arr[0] !== null) {
            const perm = new Permission();
            perm._id = parseInt(arr[0]);
            perm.permission = arr[1];
            perm.description = arr[2];
            perms_answ.push(perm);
        }
    });

    return perms_answ;
}

/**
 * Check if Role exists using the id
 * @param {Role} role
 */
async function roleExists(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't check for role in database.");
    }
    if (!role._id) {
        throw new Error("Role id was undefined: can't check for role in database.");
    }

    const answ = await db_init.getPool().query("SELECT COUNT(*) FROM roles WHERE id = $1;", [role._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Check if Role name already exist
 * @param {Role} role
 */
async function roleNameExists(role) {
    if (!(role instanceof Role)) {
        throw new Error("Arg wasn't of Role type: can't check for role name in database.");
    }
    if (!role.name) {
        throw new Error("Role name was undefined: can't check for role name in database.");
    }

    const answ = await db_init.getPool().query("SELECT COUNT(*) FROM roles WHERE name = $1;", [role.name]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

module.exports.getAllRoles = getAllRoles;
module.exports.getRole = getRole;
module.exports.addRole = addRole;
module.exports.updateRole = updateRole;
module.exports.removeRole = removeRole;
module.exports.getPermissionsFromRole = getPermissionsFromRole;
module.exports.roleExists = roleExists;
