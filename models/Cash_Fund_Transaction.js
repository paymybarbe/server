/**
 * @typedef {class} Cash_Fund_Transaction
 */
module.exports = class Cash_Fund_Transaction {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    /**
     * The user that managed the transaction
     * @type User
     */
    manager;
    /**
     * Source Cash Fund of the transaction
     * @type Cash_Fund
     */
    source_cash_fund;
    /**
     * Destination Cash Fund of the transaction
     * @type Cash_Fund
     */
    destination_cash_fund;
    /**
     * Type of the transaction. Enumeration from enums.CASH_FUNDS_OPERATIONS_TYPE
     * @type enums.CASH_FUNDS_OPERATIONS_TYPE
     */
    type;
    description;
    /**
     * Mean of the transaction. Enumeration from enums.TRANSACTION_MEANS
     * @type enums.TRANSACTION_MEANS
     */
    means;
    /**
     * @type number
     */
    amount
    /**
     * Date and hour of the transaction
     * @type Date
     */
    date;
};
