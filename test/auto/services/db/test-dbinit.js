const { expect } = require('chai');
const dbinit = require("../../../../services/db/db_init");

describe("Database initialize", function _test() {
    this.timeout(5000);
    let pool;

    it("Pool working", async () => {
        pool = dbinit.getPool();
        const result = await pool.query('SELECT NOW();');
        expect(result).to.exist;
        await dbinit.end();
    });
});
