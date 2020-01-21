const path = require("path");
const chai = require("chai");
const decache = require("decache");

chai.should();

let my_env;

before(() => {
    my_env = process.env.NODE_ENV;
});

describe("Config fetcher test", function config_fetcher_test() {
    this.timeout(5000);

    beforeEach(() => {
        decache(path.resolve(__dirname, "../../../config/config"));
    });

    afterEach(() => {
        decache(path.resolve(__dirname, "../../../config/config"));
    });

    it("Get default env", () => {
        process.env.ENV = null;
        const config = require("../../../config/config");
        config.env.should.equal("development");
    });

    it("Get production env", () => {
        process.env.ENV = "production";
        const config = require("../../../config/config");
        config.env.should.equal("production");
    });

    it("Get test env", () => {
        process.env.ENV = "test";
        const config = require("../../../config/config");
        config.env.should.equal("test");
    });
});

after(() => {
    process.env.NODE_ENV = my_env;
});
