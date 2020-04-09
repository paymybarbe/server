const chai = require('chai');
const { expect } = chai;
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

const dbinit = require("./../../../../services/db/db_init");

const seeder = require("../../../../scripts/script.seed");
/* const logger = require("../../../../services/logger").child({
    service: "test:auto:models",
    inspect_depth: 5
}); */
const dbUser = require("../../../../services/db/dbUser");
const dbRole = require("../../../../services/db/dbRole");
const dbPermission = require("../../../../services/db/dbPermission");

chai.use(deepEqualInAnyOrder);

describe("Models From Database", function _test() {
    this.timeout(5000);
    let permissions;
    let roles;
    let users;

    this.beforeEach((done) => {
        seeder.cleanDB().then(() => done());
    });

    this.afterAll((done) => {
        seeder.cleanDB().then(() => dbinit.end().then(() => done()));
    });

    function sortId(a, b) {
        return a._id - b._id;
    }

    it("Permissions Insert & Select All", (done) => {
        seeder.generatePermissions(100).then((permis) => {
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element));
            });
            Promise.all(select_permissions).then((add_perms) => dbPermission.getAllPermissions().then((sel_perms) => {
                expect(sel_perms).to.have.length(add_perms.length);

                sel_perms.sort(sortId);
                add_perms.sort(sortId);
                for (let i = 0; i < permissions.length; i++) {
                    expect(sel_perms[i].permission).to.be.equal(add_perms[i].permission);
                    expect(sel_perms[i].description).to.be.equal(add_perms[i].description);
                }
                permissions = select_permissions;
                done();
            }));
        });
    });

    it("Roles Insert & Select All", (done) => {
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
                    Promise.all(select_roles).then((add_roles) => dbRole.getAllRoles().then((sel_rollings) => {
                        expect(sel_rollings).to.have.length(add_roles.length);

                        add_roles.sort(sortId);
                        sel_rollings.sort(sortId);
                        for (let i = 0; i < roles.length; i++) {
                            expect(add_roles[i].name).to.be.equal(sel_rollings[i].name);
                            expect(add_roles[i].description).to.be.equal(sel_rollings[i].description);
                            add_roles[i].permissions.sort(sortId);
                            sel_rollings[i].permissions.sort(sortId);
                            expect(add_roles[i].permissions).to.be.eql(sel_rollings[i].permissions);
                            expect(add_roles[i].parent_role).to.be.equal(sel_rollings[i].parent_role);
                            expect(add_roles[i].next_role).to.be.equal(sel_rollings[i].next_role);
                        }
                        roles = select_roles;
                        done();
                    }));
                });
            });
        });
    });

    it("Users Insert & Select All", (done) => {
        seeder.generatePermissions(100).then((permis) => { // Generate 100 (or less if duplicates) permissions
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element)); // Add these perms to DB
            });
            Promise.all(select_permissions).then((selected_perms) => {
                seeder.generateRoles(50, selected_perms).then((rollingis) => { // Generate roles
                    roles = rollingis;
                    const select_roles = [];
                    roles.forEach((element) => {
                        select_roles.push(dbRole.addRole(element));
                    });
                    Promise.all(select_roles).then((selected_rollings) => {
                        seeder.generateUsers(100, selected_perms, selected_rollings).then((usis) => { // Generate Users
                            users = usis;
                            const select_users = [];
                            users.forEach((element) => {
                                select_users.push(dbUser.addUser(element));
                            });
                            Promise.all(select_users).then((add_users) => dbUser.getAllUsers().then((sel_uss) => {
                                expect(add_users).to.have.length(sel_uss.length);
                                add_users.sort(sortId);
                                sel_uss.sort(sortId);
                                for (let i = 0; i < add_users.length; i++) {
                                    expect(add_users[i]).to.be.deep.equalInAnyOrder(sel_uss[i]);
                                }
                                done();
                            }));
                        });
                    });
                });
            });
        });
    });

    it("Users Update", (done) => {
        seeder.generatePermissions(100).then((permis) => { // Generate 100 (or less if duplicates) permissions
            permissions = permis;
            const select_permissions = [];
            permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element)); // Add these perms to DB
            });
            Promise.all(select_permissions).then((selected_perms) => {
                seeder.generateRoles(50, selected_perms).then((rollingis) => { // Generate roles
                    roles = rollingis;
                    const select_roles = [];
                    roles.forEach((element) => {
                        select_roles.push(dbRole.addRole(element));
                    });
                    Promise.all(select_roles).then((selected_rollings) => {
                        seeder.generateUsers(100, selected_perms, selected_rollings).then((usis) => { // Generate Users
                            users = usis;
                            const select_users = [];
                            users.forEach((element) => {
                                select_users.push(dbUser.addUser(element));
                            });
                            Promise.all(select_users).then((selected_uss) => {
                                const my_trial = selected_uss[Math.floor(Math.random() * selected_uss.length)];
                                my_trial.first_name = "Miam";
                                my_trial.last_name = "Foody";
                                if (my_trial.roles.length > 1) {
                                    my_trial.roles.pop();
                                }
                                if (my_trial.personnal_permissions.length > 1) {
                                    my_trial.personnal_permissions.shift();
                                }
                                dbUser.updateUser(my_trial).then(() => dbUser.getUser(my_trial).then((my_checker) => {
                                    expect(my_trial).to.be.deep.equalInAnyOrder(my_checker);
                                    done();
                                }));
                            });
                        });
                    });
                });
            });
        });
    });
});
