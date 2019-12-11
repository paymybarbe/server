const fs = require("fs");
const path = require("path");
const chai = require("chai");
const decache = require("decache");

chai.should();

describe("Config fetcher test", function config_fetcher_test() {
    this.timeout(5000);
    const rootfolder = "../../config/";

    beforeEach(() => {
        decache(path.resolve(__dirname, "../../config/config"));
    });

    afterEach(() => {
        decache(path.resolve(__dirname, "../../config/config"));
    });

    it("Get default env", () => {
        process.env.NODE_ENV = null;
        const config = require("../../config/config");
        if (fs.existsSync(path.join(rootfolder, "production.json"))) {
            const prod_conf = JSON.parse(fs.readFileSync(path.join(rootfolder, "production.json")));
            if (prod_conf.password === null || prod_conf.password === undefined) {
                config.env.should.equal("developpement");
            }
            else {
                config.env.should.equal("production");
            }
        }
        else {
            config.env.should.equal("developpement");
        }
    });

    it("Get production env", () => {
        process.env.NODE_ENV = "production";
        if (fs.existsSync(path.join(rootfolder, "production.json"))) {
            const prod_conf = JSON.parse(fs.readFileSync(path.join(rootfolder, "production.json")));
            if (prod_conf.password === null || prod_conf.password === undefined) {
                try {
                    require("../../config/config");
                    throw new Error("No production password, but didn't raise error");
                }
                catch (ex) {
                    // error is what we need
                }
            }
            else {
                const config = require("../../config/config");
                config.env.should.equal("production");
            }
        }
        else {
            try {
                require("../../config/config");
                throw new Error("No production config, but didn't raise error");
            }
            catch (ex) {
                // error is what we need
            }
        }
    });

    it("Get test env", () => {
        process.env.NODE_ENV = "test";
        const config = require("../../config/config");
        config.env.should.equal("test");
    });
});
