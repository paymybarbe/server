/**
 * @typedef {class} Role
 */
module.exports = class Role {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name = null;
    /**
     * ID of the parent role of this role, if there is one.
     * @type number
     */
    parent_role = null;
    /**
     * ID of the next role of this role, if there is one. (1st year -> 2nd year for example)
     * @type number
     */
    next_role = null;
    /**
     * Array of the name of the permissions given to the role.
     * @type {Permission[]}
     */
    permissions = [];
};
