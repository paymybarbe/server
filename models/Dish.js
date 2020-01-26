/**
 * @typedef {class} Dish
 */
module.exports = class Dish {
    /**
     * ID of the database's column
     * @type {number}
     */
    _id;
    name;
    image;
    description;
    /**
     * @type {boolean}
     */
    hidden;
    /**
     * Prices of a product in key/value: (role |"cost"):price
     * @type {Object.<string,number>} (role |"cost"):price
     */
    prices;
    /**
     * @type {Ingredient[]}
     */
    ingredients;
    /**
     * @type {{_id:number, name:string, price_change:number}[]}
     */
    options;
};
