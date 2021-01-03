const { migrate } = require("../services/db/db_init");
const config = require("../config/config");
const logger = require("../services/logger").child({
    service: "server:scripts:init"
});

module.exports = async function init() {
    logger.info(`Initializing the application.`);
    logger.info(`Running on ${config.env.toUpperCase()} environment.`);

    logger.info("Migrating database...");
    try {
        await migrate();
    }
    catch (ex) {
        logger.error("Couldn't migrate database !\n", ex);
        process.exit();
    }
};
