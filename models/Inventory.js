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
     * Array of the products of the inventory
     * pure: If this is true, the product is a pure loss or pure win.
     * Meaning it will only affect the total stock value and not take
     * into account the money spent by buying it if it's a product you add,
     * or not spent because it was never bought if it is a product you remove.
     * @type {{product:Product, nbr:number, pure:boolean}[]}
     */
    products;
    /**
     * Array of the ingredients of the inventory
     * pure: If this is true, the ingredient is a pure loss or pure win.
     * Meaning it will only affect the total stock value and not take
     * into account the money spent by buying it if it's a ingredient you add,
     * or not spent because it was never bought if it is a ingredient you remove.
     * @type {{product:Ingredient, nbr:number, pure:boolean}[]}
     */
    ingredients;
    /**
     * Difference the inventory brings to the cost of the stocks, loss or win.
     * Should be 0 if error is true
     * @type number
     */
    difference;
};
