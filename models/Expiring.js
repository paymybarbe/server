/**
 * @typedef {class} Expiring
 * @class
 */
module.exports = class Expiring {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * Date of the expiration
     * @type Date
     */
    date;
    /**
     * User that validated the expiration
     * @type User;
     */
    manager;
    /**
     * Array of the products of the expiration
     * @type {{product:Product, nbr:number}[]}
     */
    products;
    /**
     * Array of the ingredients of the expiration
     * @type {{product:Ingredient, nbr:number}[]}
     */
    ingredients;
    /**
     * Cost of things that arn't products or ingredients
     * @type number
     */
    diverse_cost;
};
