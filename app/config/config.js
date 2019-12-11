const fs = require("fs");
const path = require("path");
const debug = require("debug")("server:conf");

function export_dev() {
    const dev_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./developpement.json")));
    process.env.NODE_ENV = "developpement";
    module.exports = dev_conf;
}

function export_prod() {
    const prod_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./production.json")));
    if (prod_conf.password === null || prod_conf.password === undefined) {
        throw new Error("No password in production config file.");
    }
    process.env.NODE_ENV = "production";
    module.exports = prod_conf;
}

if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === "null") {
    try {
        // si on a un fichier de config production...
        export_prod();
    }
    catch (ex) {
        // sinon on est en developpement.
        export_dev();
    }
}
else if (process.env.NODE_ENV === "production") {
    export_prod();
}
else {
    try {
        const env_conf = JSON.parse(fs.readFileSync(path.resolve(__dirname, `${process.env.NODE_ENV}.json`)));
        module.exports = env_conf;
    }
    catch (ex) {
        throw new Error("No config file for this environnement.");
    }
}

debug(module.exports);
