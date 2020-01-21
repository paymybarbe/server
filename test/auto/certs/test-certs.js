const fs = require("fs");
const path = require("path");
const chai = require("chai");
const tls = require("tls");
const debug = require("debug")("server:test:certs");
const config = require("./../../../config/config");

chai.should();

describe("Certs authorization checker", function config_fetcher_test() {
    this.timeout(5000);
    const certs_folder = (config.server.certs_folder === undefined) ? path.resolve(config.APP_RESOURCES, "certs/") : path.resolve(config.APP_RESOURCES, config.server.certs_folder);
    let options_serv;
    let server;

    // before(() => {
    //     process.env.APP_FOLDER = process.cwd();
    //     process.env.APP_RESOURCES = process.cwd();
    // });

    beforeEach(() => {
        debug(certs_folder);
        options_serv = {
            key: fs.readFileSync(path.resolve(certs_folder, "server-key.pem")),
            cert: fs.readFileSync(path.resolve(certs_folder, "server-crt.pem")),
            ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")),
            requestCert: true,
            rejectUnauthorized: true
        };

        server = tls.createServer(options_serv, (socket) => {
            socket.authorized.should.be.true();
        });

        server.listen(config.server.port, () => {
        });
    });

    afterEach(() => {
        server.close();
    });

    it("client 1 authorized", () => {
        const options = {
            host: config.server.host,
            port: config.server.port,
            // Necessary only if using the client certificate authentication
            key: fs.readFileSync(path.resolve(certs_folder, "client1-key.pem")),
            cert: fs.readFileSync(path.resolve(certs_folder, "client1-crt.pem")),
            ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")), // Necessary only if the server uses the self-signed certificate
            rejectUnauthorized: true,
            requestCert: true
        };

        const socket = tls.connect(options.port, options.host, options, () => {
            socket.authorized.should.equal(true);
            socket.destroy();
        });

        socket.on("error", (err) => {
            err.should.be.null();
        });
    });

    it("Client 2 authorized", () => {
        const options = {
            host: config.server.host,
            port: config.server.port,
            // Necessary only if using the client certificate authentication
            key: fs.readFileSync(path.resolve(certs_folder, "client2-key.pem")),
            cert: fs.readFileSync(path.resolve(certs_folder, "client2-crt.pem")),
            ca: fs.readFileSync(path.resolve(certs_folder, "ca-crt.pem")), // Necessary only if the server uses the self-signed certificate
            rejectUnauthorized: true,
            requestCert: true
        };

        const socket = tls.connect(options.port, options.host, options, () => {
            socket.authorized.should.equal(true);
            socket.destroy();
        });

        socket.on("error", (err) => {
            err.should.be.null();
        });
    });
});
