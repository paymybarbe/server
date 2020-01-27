/**
 * @typedef {class} Menu
 */
module.exports = class Menu {
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
    deleted;
    /**
     * Content of the menu in key:value.
     * Key is the index.
     * Value is {(dish:Dish | product:Product | category:Category), forced:boolean}
     * @type {Object.<number,{dish:Dish, product:Product, category:Category,forced:boolean}>}
     */
    content;
};
