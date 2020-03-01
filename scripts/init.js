const { migrate } = require("../services/db/db_init");
const logger = require("../services/logger").child({
    service: "server:scripts:init"
});

module.exports = async function init() {
    logger.info("Migrating database...");
    try {
        await migrate();
    }
    catch (ex) {
        logger.error("Couldn't migrate database !\n", ex);
        process.exit();
    }
};
