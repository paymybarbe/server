/**
 * @typedef {class} Category
 */
module.exports = class Category {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name = null;
    image = null;
    description = null;
    /**
     * @type boolean
     */
    hidden = false;
    /**
     * Give the display order of the categories. First is 0, then 1...
     * @type number
     */
    index = 0;
    /**
     * Array of the products of the category
     * @type {Product[]}
     */
    products = [];
};
