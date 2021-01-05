const seeder = require("../../../scripts/script.seed");

describe("Clean Database Before", function _test() {
    this.timeout(10000);

    it("Cleaned", async () => {
        await seeder.cleanDB();
    });
});
