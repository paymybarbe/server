/**
 * @typedef {class} User
 */
module.exports = class User {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    first_name = null;
    last_name = null;
    solde = 0;
    points = 0;
    pseudo = null;
    email = null;
    pass = null;
    /**
     * @type Date
     */
    date_of_birth = null;
    image = null;
    /**
     * @type Date
     */
    created_at = null;
    active = true;
    /**
     * @type Date
     */
    last_logged = null;
    /**
     * Array of the tags related to the user.
     * @type {string[]}
     */
    tags = [];
    /**
     * Array of the roles given to the user.
     * @type {Roles[]}
     */
    roles = [];

    /**
     * Array of all the permissions given to the user, from Roles and personnal.
     * @type {Permission[]}
     */
    get permissions() {
        let all_perms = [];

        all_perms = [];
        if (this.roles) {
            this.roles.forEach((role) => {
                all_perms.concat(role.permissions);
            });
        }

        if (this.personnal_permissions) {
            this.personnal_permissions.forEach((perm) => {
                if (all_perms.filter((p) => p.permission === perm.permission).length === 0) {
                    all_perms.push(perm);
                }
            });
        }

        return all_perms;
    }
    /**
     * Array of the permissions given to the user, but not coming from roles.
     * @type {Permission[]}
     */
    personnal_permissions = [];
    /**
     * Favorites products of an user in an array.
     * First product is the most liked.
     * @type Product[]
     */
    favorites = [];
    /**
     * Array of the transactions of the user. To be left empty if not used. Beware of cyclic call.
     * @type {Transaction[]}
    */
    transactions = [];
};
