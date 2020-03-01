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
                        + "array_agg(ARRAY[permissions.id::TEXT, permissions.permission, permissions.description]) AS perm_array "
                    + "FROM roles "
                    + "LEFT JOIN permissions_to_roles ON roles.id = permissions_to_roles.role_id "
                    + "LEFT JOIN permissions ON permissions.id = permissions_to_roles.perm_id "
                    + "GROUP BY roles.id;";
    const {
        rows
    } = await pool.query(queryText);

    const roles = [];
    rows.forEach((row) => {
        const role = new Role();
        role._id = row.id;
        role.next_role = row.next_role;
        role.name = row.name;
        role.parent_role = row.parent_role;

        role.permissions = [];

        row.perm_array.forEach((arr) => {
            const perm = new Permission();
            perm._id = parseInt(arr[0]);
            perm.permission = arr[1];
            perm.description = arr[2];
            role.permissions.push(perm);
        });

        roles.push(role);
    });
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
                    client.query('INSERT INTO permissions_to_roles (role_id, perm_id) VALUES ($1, $2)', [role_ret._id, permission._id])
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

module.exports.getAllRoles = getAllRoles;
module.exports.addRole = addRole;
module.exports.removeRole = removeRole;
