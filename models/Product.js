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
     * Prices of a product based on rank in key/value: role:price
     * @type {Object.<role:Role,price:number>} role:price
     */
    roles_prices;
    /**
     * Price of a product in menu.
     * @type {number}
     */
    menu_price;
    /**
     * Cost price of a product.
     * @type {number}
     */
    cost_price;
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
