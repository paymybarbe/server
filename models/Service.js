/**
 * @typedef {class} Service
 */
module.exports = class Service {
    /**
     * ID of the database's column
     * @type number
     */
    _id;

    /**
     * Date and hour of the opening of the orders for the menus of the service.
     * null if from right now.
     * @type Date
     */
    start_ordering;
    /**
     * Date and hour of the closing of the orders for the menus of the service.
     * null if forever.
     * @type Date
     */
    end_ordering;
    /**
     * Date and hour of the start of the service.
     * null if from right now.
     * @type Date
     */
    start_service;
    /**
     * Date and hour of the end of the service.
     * null if forever.
     * @type Date
     */
    end_service;
    /**
     * Total amount of menus that can be ordered.
     * If null will be calculated from the sum of the amount for each menu.
     * If still null, will be infinite.
     * @type number
     */
    amount;
    /**
     * Sum of all the menus taken.
     * @type number
     */
    taken;
    /**
     * Maximum number of menus a signle user can order.
     * If null, value of menus inside service are taken.
     * If still null, not limited.
     * @type number
     */
    max_per_user;
    /**
     * If the service is hidden from ordering.
     * @type boolean
     */
    hidden;
    /**
     * Menus inside the service
     * @type {{menu:Menu, amount:number, taken:number, max_per_user:number, hidden:boolean}[]}
     */
    menus;
    /**
     * Users participating in the service
     * @type {{user:User, points:number, status:enums.PLANNING_STATUS}[]}
     */
    users;
};
