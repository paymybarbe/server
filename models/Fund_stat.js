/**
 * @typedef {class} Fund_stats
 */
module.exports = class Fund_stats {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name;
    /**
     * To be add to the total sum of money spent
     * @type number
     */
    CA;
    /**
     * To be add to the total amount of benefits made
     * @type number
     */
    benefits;
    /**
     * To be add to the total amount of loss made.
     * Losses are all the products, ingredients, menu... that were bought but not sold.
     * @type number
     */
    losses;
    /**
     * To be add to the total stock value
     * @type number
     */
    stocks_value;
    /**
     * To be add to the total points given
     * @type number
     */
    points_given
    /**
     * Date if the new fund state.
     * @type Date
     */
    date;;
};
