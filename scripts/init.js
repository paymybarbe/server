const { migrate } = require("../services/db/dbinit");

module.exports = async function init() {
    await migrate();
};
