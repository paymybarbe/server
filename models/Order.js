/**
 * @typedef {class} Order
 */
module.exports = class Order {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * The user that ordered the order
     * @type User
     */
    user;
    /**
     * The user that managed the order
     * @type User
     */
    manager;
    /**
     * Status of the order, from enums.ORDER_STATUS
     * @type ORDER_STATUS
     */
    status;
    /**
     * Date and hour at which the order was created
     * @type Date
     */
    ordered_at;
    /**
     * Date and hour at which the order should be served
     * @type Date
     */
    for_date;
    /**
     * Date and hour at which the order was last updated
     * @type Date
     */
    last_change;
    /**
     * @typedef Product_Order
     * @type {{product: Product, quantity:number, taken:number}}
     */
    /**
     * Content of the order in an Array of Product_Order, Menu_Order, and Dish_Order
     * @type {(Product_Order | Menu_Order)[]}
     */
    content;
};
