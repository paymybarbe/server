// const debug = require("debug")("server:service:server");
const path = require("path");
const tls = require("tls");
const fs = require("fs");
const config = require("../config/config");

const certs_folder = (config.server.certs_folder === undefined) ? path.resolve(process.env.APP_RESOURCES, "certs/") : path.resolve(process.env.APP_RESOURCES, "certs/", config.server.certs_folder);

const options = {
    key: (process.env.SERVER_KEY === undefined) ? fs.readFileSync(path.resolve(certs_folder, "server-key.pem")) : process.env.SERVER_KEY,
    cert: fs.readFileSync(path.resolve(certs_folder, "server-crt.pem")),
    ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")),
    requestCert: true,
    rejectUnauthorized: true
};

const server = tls.createServer(options, (socket) => {
    console.log("server connected", socket.authorized ? "authorized" : "unauthorized");
    socket.write("welcome!\n");
    socket.setEncoding("utf8");
    socket.pipe(socket);
});

server.listen(config.server.port, () => {
    console.log("server bound");
});
