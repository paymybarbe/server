const db_init = require("../services/db/db_init");
const logger = require("../services/logger").child({
    service: "server:scripts:quit"
});

module.exports = async function quit() {
    logger.info("Closing database pool...");
    await db_init.end();
};
