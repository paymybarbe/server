const { expect } = require('chai');
const dbinit = require("./../../../../services/db/db_init");

const seeder = require("../../../../scripts/script.seed");

const dbUser = require("../../../../services/db/dbUser");
const dbRole = require("../../../../services/db/dbRole");
const dbPermission = require("../../../../services/db/dbPermission");

describe("Permissions From Database", function _test() {
    this.timeout(5000);
    let permissions;
    let roles;
    let users;

    this.beforeEach((done) => {
        seeder.cleanDB().then(() => done());
    });

    this.afterAll(() => {
        dbinit.end();
    });

    it("Permissions Insert", (done) => {
        seeder.generatePermissions(100).then((permis) => {
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element));
            });
            Promise.all(select_permissions).then((selected_perms) => {
                expect(selected_perms).to.have.length(permissions.length);

                for (let i = 0; i < permissions.length; i++) {
                    expect(selected_perms[i].permission).to.be.equal(permissions[i].permission);
                    expect(selected_perms[i].description).to.be.equal(permissions[i].description);
                }
                permissions = select_permissions;
                done();
            });
        });
    });

    it("Roles Insert", (done) => {
        seeder.generatePermissions(100).then((permis) => {
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element));
            });
            Promise.all(select_permissions).then((selected_perms) => {
                seeder.generateRoles(50, selected_perms).then((rollingis) => {
                    roles = rollingis;
                    const select_roles = [];
                    roles.forEach((element) => {
                        select_roles.push(dbRole.addRole(element));
                    });
                    Promise.all(select_roles).then((selected_rollings) => {
                        expect(selected_rollings).to.have.length(roles.length);

                        for (let i = 0; i < roles.length; i++) {
                            expect(selected_rollings[i].name).to.be.equal(roles[i].name);
                            expect(selected_rollings[i].description).to.be.equal(roles[i].description);
                            expect(selected_rollings[i].permissions).to.be.eql(roles[i].permissions);
                            expect(selected_rollings[i].parent_role).to.be.equal(roles[i].parent_role);
                            expect(selected_rollings[i].next_role).to.be.equal(roles[i].next_role);
                        }
                        roles = select_roles;
                        done();
                    });
                });
            });
        });
    });

    it("Users Insert", (done) => {
        seeder.generatePermissions(100).then((permis) => {
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element));
            });
            Promise.all(select_permissions).then((selected_perms) => {
                seeder.generateRoles(50, selected_perms).then((rollingis) => {
                    roles = rollingis;
                    const select_roles = [];
                    roles.forEach((element) => {
                        select_roles.push(dbRole.addRole(element));
                    });
                    Promise.all(select_roles).then((selected_rollings) => {
                        seeder.generateUsers(100, selected_perms, selected_rollings).then((usis) => {
                            users = usis;
                            const select_users = [];
                            users.forEach((element) => {
                                select_users.push(dbUser.addUser(element));
                            });
                            Promise.all(select_users).then((selected_uss) => {
                                expect(selected_uss).to.have.length(users.length);

                                for (let i = 0; i < users.length; i++) {
                                    expect(selected_uss[i]).to.be.eql(users[i]);
                                }
                                users = select_users;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
