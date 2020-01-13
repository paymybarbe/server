const { expect } = require('chai');
const dbinit = require("./../../../services/db/dbinit");

describe("Database initialize", function _test() {
    this.timeout(5000);
    let pool;

    it("Pool working", (done) => {
        pool = dbinit.getPool();
        pool.query('SELECT NOW()', (err, res) => {
            expect(err).to.not.exist;
            expect(res).to.exist;
            pool.end();
            done();
        });
    });
});
