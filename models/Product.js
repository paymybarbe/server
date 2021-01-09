const Role = require('./Role');

/**
 * @typedef {class} Product
 */
module.exports = class Product {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name = null;
    image = null;
    stock = null;
    description = null;
    threshold = 0;
    /**
     * @type boolean
     */
    fixed_threshold = false;
    /**
     * @type boolean
     */
    hidden = false;
    /**
     * @type boolean
     */
    deleted = false;
    /**
     * Prices of a product based on role in key/value: role_id:price.
     * Use `setRolePrice()` and `getRolePrice()` to use.
     * @type {Object.<string,price:number>} role_id:price
     */
    roles_prices = {};
    /**
     * Set the price for the given role.
     * @param {Role} role
     * @param {number} price
     */
    setRolePrice(role, price) {
        if (!(role instanceof Role)) {
            throw new Error("Arg wasn't of Role type: can't set role price in the model.");
        }
        if (!role._id) {
            throw new Error("Role's id wasn't defined: can't set role price in the model.");
        }
        this.roles_prices[role._id.toString()] = price;
    }
    /**
     * Get the price for the given role.
     * @param {Role} role
     * @returns {number}
     */
    getRolePrice(role) {
        if (!(role instanceof Role)) {
            throw new Error("Arg wasn't of Role type: can't get role price from the model.");
        }
        if (!role._id) {
            throw new Error("Role's id wasn't defined: can't get role price from the model.");
        }
        if (!this.roles_prices) {
            return undefined;
        }
        return this.roles_prices[role._id.toString()] ? this.roles_prices[role._id.toString()] : null;
    }
    /**
     * Delete the price for the given role.
     * @param {Role} role
     */
    deleteRolePrice(role) {
        if (!(role instanceof Role)) {
            throw new Error("Arg wasn't of Role type: can't set role price in the model.");
        }
        if (!role._id) {
            throw new Error("Role's id wasn't defined: can't set role price in the model.");
        }
        delete this.roles_prices[role._id.toString()];
    }
    /**
     * Price of a product in menu.
     * @type {number}
     */
    menu_price = 0;
    /**
     * Cost price of a product.
     * @type {number}
     */
    cost_price = 0;
    // /**
    //  * Prices modifier of the product in key/value: role:{multiplier, add}
    //  * @type {Object.<role:Role,{multiplier:number, add:number}>} role:{multiplier, add}
    //  */
    // roles_settings;
    // /**
    //  * Prices modifier of the product in a menu: {multiplier, add}
    //  * @type {{multiplier:number, add:number}}
    //  */
    // menu_settings;
};
