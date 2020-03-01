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
        const permission = new Permission();
        permission._id = row.id;
        permission.permission = row.permission;
        permission.description = row.description;

        permissions.push(permission);
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
    const permission_ret = JSON.parse(JSON.stringify(permission));

    const queryText = "INSERT INTO permissions (permission, "
                                            + "description) "
    + "VALUES ($1, $2) RETURNING id;";

    const params = [
        permission_ret.permission,
        permission_ret.description
    ];

    const res = await pool.query(queryText, params);
    permission_ret._id = res.rows[0].id;

    return permission_ret;
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
module.exports.getAllPermissions = getAllPermissions;
module.exports.addPermission = addPermission;
module.exports.removePermission = removePermission;
