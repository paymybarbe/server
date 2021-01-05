const db_init = require("./db_init");
// const logger = require("../logger").child({
//     service: "server:services:db:dbPermission"
// });
const Permission = require("../../models/Permission");
// eslint-disable-next-line no-unused-vars
const logger = require("../logger");

/**
 * Get all permissions from the database.
 * @returns {Promise<Permission[]>}
 */
async function getAllPermissions() {
    const queryText = "SELECT * FROM permissions;";
    const {
        rows
    } = await db_init.getPool().query(queryText);

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
 * @returns {Promise<Permission>}
 */
async function addPermission(permission) {
    if (!(permission instanceof Permission)) {
        throw new Error("Arg wasn't of Permission type: can't add permission to database.");
    }
    if (!permission.permission) {
        throw new Error("Permission name was undefined: can't add permission to database.");
    }
    if (await permissionNameExists(permission)) {
        throw new Error("Permission already exists: can't add permission to database.");
    }

    const queryText = "INSERT INTO permissions (permission, "
                                            + "description) "
    + "VALUES ($1, $2) RETURNING id;";

    const params = [
        permission.permission,
        permission.description
    ];

    const res = await db_init.getPool().query(queryText, params);
    // eslint-disable-next-line no-param-reassign
    permission._id = res.rows[0].id;

    return permission;
}

/**
 * Remove a Permission
 * @param {Permission} permission
 */
async function removePermission(permission) {
    if (!(permission instanceof Permission)) {
        throw new Error("Arg wasn't of Permission type: can't remove permission from database.");
    }
    if (!permission.permission) {
        throw new Error("Permission name was undefined: can't remove permission from database.");
    }

    if (!await permissionExists(permission)) {
        throw new Error("Permission id was not found in database: can't remove permission.");
    }
    await db_init.getPool().query("DELETE FROM permissions WHERE id = $1;", [permission._id]);
}

/**
 * Check if Permission exists
 * @param {Permission} permission
 */
async function permissionExists(permission) {
    if (!(permission instanceof Permission)) {
        throw new Error("Arg wasn't of Permission type: can't check for permission in database.");
    }
    if (!permission.permission) {
        throw new Error("Permission name was undefined: can't check for permission in database.");
    }
    if (!permission._id) {
        throw new Error("Permission id was undefined: can't check for permission in database.");
    }

    const answ = await db_init.getPool().query("SELECT COUNT(*) FROM permissions WHERE permission = $1 AND id = $2;", [permission.permission, permission._id]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

/**
 * Check if Permission name already exist
 * @param {Permission} permission
 */
async function permissionNameExists(permission) {
    if (!(permission instanceof Permission)) {
        throw new Error("Arg wasn't of Permission type: can't check for permission name in database.");
    }
    if (!permission.permission) {
        throw new Error("Permission name was undefined: can't check for permission name in database.");
    }

    const answ = await db_init.getPool().query("SELECT COUNT(*) FROM permissions WHERE permission = $1;", [permission.permission]);
    if (Number(answ.rows[0].count) === 1) {
        return true;
    }
    return false;
}

module.exports.getAllPermissions = getAllPermissions;
module.exports.addPermission = addPermission;
module.exports.removePermission = removePermission;
module.exports.permissionExists = permissionExists;
