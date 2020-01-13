const { migrate } = require("../services/db/dbinit");

module.exports = function init() {
    migrate();
};
