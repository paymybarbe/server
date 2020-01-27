/**
 * @typedef {class} Product
 */
module.exports = class Product {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name;
    image;
    stock;
    description;
    threshold;
    /**
     * @type boolean
     */
    fixed_threshold;
    /**
     * @type boolean
     */
    hidden;
    /**
     * @type boolean
     */
    deleted;
    /**
     * Prices of a product in key/value: (role | "menu" | "cost"):price
     * @type {Object.<string,number>} (role | "menu" | "cost"):price
     */
    prices;
    /**
     * Prices of a product in key/value: (role | "default"):{multiplier, add}
     * @type {Object.<string,{multiplier:number, add:number}>} (role | "default"):{multiplier, add}
     */
    settings;
};
