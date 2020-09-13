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

    this.beforeAll((done) => {
        seeder.cleanDB().then(() => done());
    });

    this.afterAll((done) => {
        seeder.cleanDB().then(() => dbinit.end().then(() => done()));
    });

    function sortId(a, b) {
        return a._id - b._id;
    }

    it("Permissions Insert & Select All equals", async () => {
        permissions = await seeder.generatePermissions(30);
        const select_permissions = [];
        permissions.forEach((element) => {
            select_permissions.push(dbPermission.addPermission(element));
        });

        const add_perms = await Promise.all(select_permissions);
        const sel_perms = await dbPermission.getAllPermissions();

        expect(sel_perms).to.have.length(add_perms.length);

        sel_perms.sort(sortId);
        add_perms.sort(sortId);
        for (let i = 0; i < permissions.length; i++) {
            expect(sel_perms[i].permission).to.be.equal(add_perms[i].permission);
            expect(sel_perms[i].description).to.be.equal(add_perms[i].description);
        }
        permissions = add_perms;
    });

    it("Roles Insert & Select All equals", async () => {
        roles = await seeder.generateRoles(15, permissions);

        const select_roles = [];
        roles.forEach((element) => {
            select_roles.push(dbRole.addRole(element));
        });

        const add_roles = await Promise.all(select_roles);
        const sel_rollings = await dbRole.getAllRoles();

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
        roles = add_roles;
    });

    it("Users Insert & Select All equals", async () => {
        users = await seeder.generateUsers(10, permissions, roles);
        const select_users = [];
        users.forEach((element) => {
            select_users.push(dbUser.addUser(element));
        });

        const add_users = await Promise.all(select_users);
        const sel_uss = await dbUser.getAllUsers();

        expect(add_users).to.have.length(sel_uss.length);
        add_users.sort(sortId);
        sel_uss.sort(sortId);
        for (let i = 0; i < add_users.length; i++) {
            expect(add_users[i]).to.be.deep.equalInAnyOrder(sel_uss[i]);
        }

        users = add_users;
    });

    it("Users Update", async () => {
        const my_trial = users[Math.floor(Math.random() * users.length)]; // Choose random user
        // Change several values
        my_trial.first_name = "Miam";
        my_trial.last_name = "Foody";
        if (my_trial.roles.length > 1) {
            my_trial.roles.pop();
        }
        if (my_trial.personnal_permissions.length > 1) {
            my_trial.personnal_permissions.shift();
        }
        await dbUser.updateUser(my_trial);
        const my_checker = await dbUser.getUser(my_trial);
        // Check if user was updated with our changes
        expect(my_trial).to.be.deep.equalInAnyOrder(my_checker);
    });
});
