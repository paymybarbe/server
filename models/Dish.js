const Role = require('./Role');

/**
 * @typedef {class} Dish
 */
module.exports = class Dish {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name = null;
    image = null;
    description = null;
    /**
     * @type boolean
     */
    hidden = false;
    /**
     * @type boolean
     */
    deleted = false;
    /**
     * Prices of a dish based on role in key/value: role_id:price.
     * @type {Object.<string,number>} role_id:price
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
     * Cost price of a dish.
     * @type {number}
     */
    cost_price = 0;
    /**
     * @type {Ingredient[]}
     */
    ingredients = 0;
    /**
     * @type {{name:string, price_change:number}[]}
     */
    options = [];
};
