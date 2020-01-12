// const debug = require("debug")("server:service:server");
const path = require("path");
const tls = require("tls");
const fs = require("fs");
const logger = require("./logger").child({
    service: "server:services:server"
});
const config = require("../config/config");

const certs_folder = (config.server.certs_folder === undefined) ? path.resolve(process.env.APP_RESOURCES, "certs/") : path.resolve(process.env.APP_RESOURCES, "certs/", config.server.certs_folder);

const options = {
    key: fs.readFileSync(path.resolve(certs_folder, "server-key.pem")),
    cert: fs.readFileSync(path.resolve(certs_folder, "server-crt.pem")),
    ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")),
    requestCert: true,
    rejectUnauthorized: true
};

const server = tls.createServer(options, (socket) => {
    logger.info("server connected", socket.authorized ? "authorized" : "unauthorized");
    socket.setEncoding("utf8");
});

server.listen(config.server.port, () => {
    logger.info("Server is listening on 127.0.0.1:", config.server.port);
});
