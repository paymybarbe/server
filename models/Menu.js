/* eslint-disable no-unused-vars */
const Product = require("./Product");
const Dish = require("./Dish");
const Category = require("./Category");
const logger = require("../services/logger");

/**
 * @typedef {class} Menu
 */
module.exports = class Menu {
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
    deleted = false;
    /**
     * Content of the menu in an array ordered by the index (in database) of the products.
     * Value is {(dish:Dish | product:Product | category:Category), forced:boolean}
     * @type {{dish:Dish, product:Product, category:Category,forced:boolean}[]}
     */
    content = [];

    /**
     * Add a dish, a product or a category to the menu at last place.
     * Forced is true if the user must always choose the content in the menu.
     * @param {Dish | Product | Category} new_content
     * @param {boolean} is_forced
     */
    addContent(new_content, is_forced) {
        if (typeof is_forced !== "boolean") {
            throw new Error("Can't add content to menu: is_forced arg wasn't a boolean.");
        }
        if (new_content instanceof Dish) {
            this.content.push({
                dish: new_content
            });
        }
        else if (new_content instanceof Product) {
            this.content.push({
                product: new_content
            });
        }
        else if (new_content instanceof Category) {
            this.content.push({
                category: new_content
            });
        }
        else {
            // logger.debug(new_content);
            throw new Error("Trying to add content to a menu that isn't a product, dish or category.");
        }

        this.content[this.content.length - 1].forced = is_forced;
    }

    /**
     * Remove all content from menu.
     */
    removeAllContent() {
        // Yes it works this way.
        this.content.length = 0;
    }
};
