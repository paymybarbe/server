const fs = require("fs");
const path = require("path");
// const logger = require("./../services/logger").child({ service: "server:config" });

process.env.BIN_FOLDER = process.cwd(); // External Resources
process.env.APP_RESOURCES = __dirname; // Internal Resources

if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === "null") {
    process.env.NODE_ENV = "development";
}

try {
    const env_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, `${process.env.NODE_ENV}.json`)));
    module.exports = env_conf;
}
catch (ex) {
    throw new Error("No config file for this environnement.");
}
