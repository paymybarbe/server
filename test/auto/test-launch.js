// const Application = require('spectron').Application;
// const assert = require('assert');
// const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
// const path = require('path');

// describe('Application launch', function the_describe() {
//     this.timeout(10000);

//     beforeEach(function initWindow() {
//         this.app = new Application({
//             path: electronPath,
//             args: [path.join(__dirname, '../../main.js')]
//         });
//         return this.app.start();
//     });

//     afterEach(function destroyWindow() {
//         if (this.app && this.app.isRunning()) {
//             return this.app.stop();
//         }
//         return null;
//     });

//     it('shows an initial window', function showWindow() {
//         return this.app.client.getWindowCount().then((count) => {
//             assert.strictEqual(count, 1);
//             // Please note that getWindowCount() will return 2 if `dev tools` are opened.
//             // assert.equal(count, 2)
//         });
//     });
// });
