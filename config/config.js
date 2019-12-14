const fs = require("fs");
const path = require("path");
const debug = require("debug")("server:config");

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

debug(module.exports);
