/* eslint-disable max-len */
/**
 * @typedef {class} Menu_Order
 */
module.exports = class Menu_Order {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * If the menu was entirely validated
     * @type boolean
     */
    taken;
    /**
     * @typedef Option
     * @type {{_id:number, name:string, price_change:number}}
     */
    /**
     * Dishes and products inside a Menu Order in key/value: index:value
     * options is only for dishes.
     * @type {Object.<number,{dish:Dish, product:Product, options:Option[], quantity:number, taken:number}>}
     */
    content;
};
