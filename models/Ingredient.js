/**
 * @typedef {class} Ingredient
 */
module.exports = class Ingredient {
    /**
     * ID of the database's column
     * @type {number}
     */
    _id;
    name;
    stock;
    /**
     * Prices of a product in key/value: "cost":price
     * @type {Object.<string,number>} "cost":price
     */
    prices;
};
