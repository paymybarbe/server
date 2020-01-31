/**
 * @typedef {class} Inventory
 * @class
 */
module.exports = class Inventory {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * Date of the inventory
     * @type Date
     */
    date;
    /**
     * User that validated the inventory
     * @type User;
     */
    manager;
    /**
     * Array of the products of the category
     * @type {{product:product, nbr:number}[]}
     */
    products;
    /**
     * Difference the inventory brings to the cost of the stocks, loss or win.
     * Should be 0 if error is true
     * @type number
     */
    difference;
    /**
     * If the products from the inventory never existed.
     * They won't be listed in the loss and will be treated as if they never were added
     * @type boolean
     */
    error;
};
