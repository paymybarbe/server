/**
 * @typedef {class} Cash_Fund
 */
module.exports = class Cash_Fund {
    /**
     * ID of the database's column
     * @type number
     */
    _id;
    name;
    /**
     * Amount of money in the cash fund
     * @type {number}
     */
    fund;
    /**
     * The cash fund is not from our organization.
     * @type {boolean}
     */
    exterior;
    /**
     * Cash go there by default. Only one should be default.
     * @type {boolean}
     */
    by_default;
};
