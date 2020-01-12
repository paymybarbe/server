const fs = require("fs");
const path = require("path");
const logger = require("./../services/logger").child({
    service: "server:config"
});
// const logger = require("./../services/logger").child({ service: "server:config" });

process.env.BIN_FOLDER = process.cwd(); // External Resources
process.env.APP_RESOURCES = __dirname; // Internal Resources

if (process.env.ENV === undefined || process.env.ENV === "null") {
    process.env.NODE_ENV = "development";
    process.env.ENV = "development";
}
else if (process.env.ENV === "production") {
    process.env.NODE_ENV = "production";
}
else {
    process.env.NODE_ENV = "development";
}

let env_conf;
try {
    env_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, `${process.env.ENV}.json`)));
}
catch (ex) {
    throw new Error("No config file for this environnement.");
}

if (!env_conf.database) {
    logger.error(new Error("No database.URI in configuration file ! Can't connect !"));
    process.exit(1);
}
if (!env_conf.database.uri) {
    logger.error(new Error("No database URI in configuration file ! Can't connect !"));
    process.exit(1);
}
module.exports = env_conf;
