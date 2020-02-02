/**
 * @typedef {class} Inventory
 */
class Inventory {
    /**
     * ID of the database's column
     * @type number
     * @memberof class:Inventory
     */
    _id;
    /**
     * Date of the inventory
     * @type Date
     */
    date;
    /**
     * User that drove to the place
     * @type User;
     */
    driver;
    /**
     * User that validated the inventory
     * @type User;
     */
    manager;
    /**
    * @type {{_id:number, name:string, distance:number}}
    */
    place;
    /**
     * Array of the products inside the restocking,
     * with it's number of stack, number of products in stack and TVA
     * @type {{product:product, TVA:number, nbr_stack:number, nbr_in_stack:number}[]}
     */
    products;
    /**
     * Array of the ingredient inside the restocking,
     * with it's number of stack, number of ingredients in stack and TVA
     * @type {{ingredient:Ingredient, TVA:number, nbr_stack:number, nbr_in_stack:number}[]}
     */
    ingredients;
    /**
     * Cost of things that arn't products or ingredients
     * @type number
     */
    diverse_cost;
}
module.exports = Inventory;
