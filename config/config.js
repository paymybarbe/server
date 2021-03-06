const fs = require("fs");
const path = require("path");
const logger = require("../services/logger").child({
    service: "server:config"
});
// const logger = require("./../services/logger").child({ service: "server:config" });

process.env.BIN_FOLDER = process.cwd(); // External Resources
process.env.APP_RESOURCES = path.resolve(__dirname, '../'); // Internal Resources

if (process.env.ENV === undefined || process.env.ENV === "null" || process.env.ENV === "dev") {
    process.env.NODE_ENV = "development";
    process.env.ENV = "development";
}
else if (process.env.ENV === "production" || process.env.ENV === "prod") {
    process.env.NODE_ENV = "production";
    process.env.ENV = "production";
}

let env_conf = {};
try {
    env_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, `${process.env.ENV}.json`)));
}
catch (ex) {
    logger.error("No config file for this environnement.", ex);
    process.exit(-1);
}
/**
 *  External Resources
 */
env_conf.BIN_FOLDER = process.env.BIN_FOLDER;
/**
 * Internal Resources
 */
env_conf.APP_RESOURCES = process.env.APP_RESOURCES;
module.exports = env_conf;
logger.silly("Actual config: ", env_conf);
