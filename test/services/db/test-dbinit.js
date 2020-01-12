/* eslint-disable no-unused-expressions */
const { Pool, Client } = require('pg');
const { expect } = require('chai');
const config = require("./../../../config/config");

describe("Database initialize", function dbinit_test() {
    this.timeout(5000);
    let pool;
    let client;

    it("Pool working", (done) => {
        pool = new Pool({
            connectionString: config.database.uri
        });
        pool.query('SELECT NOW()', (err, res) => {
            expect(err).to.not.exist;
            expect(res).to.exist;
            pool.end();
            done();
        });
    });

    it("Client working", (done) => {
        client = new Client({
            connectionString: config.database.uri
        });
        client.connect();
        client.query('SELECT NOW()', (err, res) => {
            expect(err).to.not.exist;
            expect(res).to.exist;
            client.end();
            done();
        });
    });
});
