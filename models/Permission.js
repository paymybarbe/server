/**
 * @typedef {class} Permission
 */
module.exports = class Permission {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * Text identifying the permission
     * @type string
     */
    permission;
    /**
     * Description of the permission
     * @type string
     */
    description;
};
