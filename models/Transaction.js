/**
 * @typedef {class} Transaction
 */
module.exports = class Transaction {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * The user concerned by the transaction
     * @type User
     */
    user;
    /**
     * The user that managed the transaction
     * @type User
     */
    manager;
    name;
    description;
    /**
     * Type of the transaction. Enumeration from enums.CASH_FUNDS_OPERATIONS_TYPE
     * @type enums.TRANSACTION_TYPE
     */
    type;
    /**
     * Mean of the transaction. Enumeration from enums.TRANSACTION_MEANS
     * @type enums.TRANSACTION_MEANS
     */
    means;
    /**
     * @type number
     */
    money
    /**
     * @type number
     */
    points
    /**
     * @type number
     */
    previous_money
    /**
     * @type number
     */
    previous_points
    /**
     * Date and hour of the transaction
     * @type Date
     */
    date;
};
