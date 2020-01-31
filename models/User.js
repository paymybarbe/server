/**
 * @typedef {class} User
 */
module.exports = class User {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    first_name;
    last_name;
    solde = 0;
    points = 0;
    pseudo;
    email;
    pass;
    date_of_birth;
    image;
    created_at;
    active;
    /**
     * Array of the tags related to the user.
     * @type {string[]}
     */
    tags;
    /**
     * Array of the names of the roles related to the user.
     * @type {string[]}
     */
    roles;
    /**
     * Array of the permissions given to the user.
     * @type {string[]}
     */
    permissions;
    /**
     * Favorites products of an user in key/value: index:product_id
     * @type {Object.<number,number>} index:product_id
     */
    favorites;
    /**
     * Array of the transactions of the user. To be left empty if not used. Beware of cyclic call.
     * @type {Transaction[]}
    */
    transactions;
};
