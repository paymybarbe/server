const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbRole"
// });

const Role = require("../../models/Role");
const Permission = require("../../models/Permission");

const pool = db_init.getPool();

/**
 * Get all roles from the database.
 * @return {roles[]}
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
    } = await pool.query(queryText);

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
 * Add a role, return the role added
 * @param {Role} role
 * @returns {Role}
 */
async function addRole(role) {
    if (!role) {
        throw new Error("Role was undefined: can't add role to database.");
    }
    const role_ret = JSON.parse(JSON.stringify(role));
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO roles (name, "
                                            + "parent_role, "
                                            + "next_role) "
        + "VALUES ($1, $2, $3) RETURNING id;";

        const params = [
            role_ret.name,
            role_ret.parent_role,
            role_ret.next_role
        ];

        const res = await client.query(queryText, params);
        role_ret._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (role_ret.permissions) {
            role_ret.permissions.forEach((permission) => {
                promises.push(
                    client.query('INSERT INTO permissions_to_roles (role_id, perm_id) VALUES ($1, $2)',
                        [role_ret._id, permission._id])
                );
            });
        }

        await Promise.all(promises);
        await client.query('COMMIT');

        return role_ret;
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
 * Remove a role
 * @param {Role} role
 */
async function removeRole(role) {
    if (!role) {
        throw new Error("Role was undefined: can't remove role from database.");
    }

    await pool.query("DELETE FROM roles WHERE id = $1;", [role._id]);
}

/**
 * Get all permissions from a role.
 * @param {Role} role
 * @return {Permission[]}
 */
async function getPermissionsFromRole(role) {
    if (!role) {
        throw new Error("Role was undefined: can't get role permissions."); // TODO: custom errors
    }
    if (!role._id) {
        throw new Error("Role id was undefined: can't get role permissions.");
    }
    const queryText = "SELECT roles.*, "
                        + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description])"
                        + " AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "WHERE roles.id = $1"
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await pool.query(queryText, [role._id]);
    const roles = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].id !== null) {
            const my_role = new Role();
            my_role._id = rows[i].id;
            my_role.next_role = rows[i].next_role;
            my_role.name = rows[i].name;
            my_role.parent_role = rows[i].parent_role;

            my_role.permissions = [];

            rows[i].perm_array.forEach((arr) => {
                if (arr[0] !== null) {
                    const perm = new Permission();
                    perm._id = parseInt(arr[0]);
                    perm.permission = arr[1];
                    perm.description = arr[2];
                    my_role.permissions.push(perm);
                }
            });

            roles.push(my_role);
        }
    }

    return roles;
}

/**
 * Check if Role exists
 * @param {Role} role
 */
async function roleExists(role) {
    if (!role) {
        throw new Error("Permission was undefined: can't remove permission from database.");
    }
    if (role._id) {
        const {
            rows
        } = pool.query("SELECT COUNT(*) FROM roles WHERE id = $1;", [role._id]);
        return rows.length;
    }
    if (role.name) {
        const {
            rows
        } = pool.query("SELECT COUNT(*) FROM roles WHERE name = $1;", [role.name]);
        return rows.length;
    }
    return false;
}

module.exports.getAllRoles = getAllRoles;
module.exports.addRole = addRole;
module.exports.removeRole = removeRole;
module.exports.getPermissionsFromRole = getPermissionsFromRole;
module.exports.roleExists = roleExists;
