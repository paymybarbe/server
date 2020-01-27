/**
 * @typedef {class} Category
 */
module.exports = class Category {
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
     * Give the display order of the categories. First is 0, then 1...
     * @type number
     */
    index;
    /**
     * Array of the products of the category
     * @type {Product[]}
     */
    products;
};
