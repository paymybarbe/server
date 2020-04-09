const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbPermission"
// });
const Permission = require("../../models/Permission");

const pool = db_init.getPool();

/**
 * Get all permissions from the database.
 * @return {Permission[]}
 */
async function getAllPermissions() {
    const queryText = "SELECT * FROM permissions;";
    const {
        rows
    } = await pool.query(queryText);

    const permissions = [];

    rows.forEach((row) => {
        if (row.id !== null) {
            const permission = new Permission();
            permission._id = row.id;
            permission.permission = row.permission;
            permission.description = row.description;

            permissions.push(permission);
        }
    });
    return permissions;
}

/**
 * Add a Permission, return the Permission added
 * @param {Permission} permission
 * @returns {Permission}
 */
async function addPermission(permission) {
    if (!permission) {
        throw new Error("Permission was undefined: can't add permission to database.");
    }

    const queryText = "INSERT INTO permissions (permission, "
                                            + "description) "
    + "VALUES ($1, $2) RETURNING id;";

    const params = [
        permission.permission,
        permission.description
    ];

    const res = await pool.query(queryText, params);
    // eslint-disable-next-line no-param-reassign
    permission._id = res.rows[0].id;

    return permission;
}

/**
 * Remove a Permission
 * @param {Permission} permission
 */
async function removePermission(permission) {
    if (!permission) {
        throw new Error("Permission was undefined: can't remove permission from database.");
    }
    await pool.query("DELETE FROM permissions WHERE id = $1;", [permission._id]);
}

/**
 * Check if Permission exists
 * @param {Permission} permission
 */
async function permissionExists(permission) {
    if (!permission) {
        throw new Error("Permission was undefined: can't remove permission from database.");
    }
    if (permission._id) {
        const {
            rows
        } = pool.query("SELECT COUNT(*) FROM permissions WHERE id = $1;", [permission._id]);
        return rows.length;
    }
    if (permission.permission) {
        const answ = pool.query("SELECT COUNT(*) FROM permissions WHERE permission = $1;", [permission.permission]);
        return answ;
    }
    return false;
}

module.exports.getAllPermissions = getAllPermissions;
module.exports.addPermission = addPermission;
module.exports.removePermission = removePermission;
module.exports.permissionExists = permissionExists;
