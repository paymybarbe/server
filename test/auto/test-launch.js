const { Application } = require("spectron");
const assert = require("assert");
const electronPath = require("electron"); // Require Electron from the binaries included in node_modules.
const path = require("path");

describe("Application Launch", function testAppLaunch() {
    this.timeout(10000);

    beforeEach(function initApp() {
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: electronPath,

            // Assuming you have the following directory structure

            //  |__ my project
            //     |__ ...
            //     |__ main.js
            //     |__ package.json
            //     |__ index.html
            //     |__ ...
            //     |__ test
            //        |__ spec.js  <- You are here! ~ Well you should be.

            // The following line tells spectron to look and use the main.js file
            // and the package.json located 1 level above.
            args: [path.join(__dirname, "../../main.js")]
        });
        return this.app.start();
    });

    afterEach(function destroyApp() {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
        return null;
    });

    it("Shows an initial window", function testShowWindow() {
        return this.app.client.getWindowCount().then((count) => {
            assert.equal(count, 1);
            // Please note that getWindowCount() will return 2 if `dev tools` are opened.
            // assert.equal(count, 2)
        });
    });
});
