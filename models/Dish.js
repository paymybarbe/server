/**
 * @typedef {class} Dish
 */
module.exports = class Dish {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name;
    image;
    description;
    /**
     * @type boolean
     */
    hidden;
    /**
     * @type boolean
     */
    deleted;
    /**
     * Prices of a dish based on rank in key/value: role_id:price.
     * @type {Object.<number,price:number>} role_id:price
     */
    roles_prices;
    /**
     * Cost price of a dish.
     * @type {number}
     */
    cost_price;
    /**
     * @type {Ingredient[]}
     */
    ingredients;
    /**
     * @type {{_id:number, name:string, price_change:number}[]}
     */
    options;
};
