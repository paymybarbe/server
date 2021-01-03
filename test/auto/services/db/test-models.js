const chai = require('chai');
const { expect } = chai;
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

const dbinit = require("../../../../services/db/db_init");

const seeder = require("../../../../scripts/script.seed");
/* const logger = require("../../../../services/logger").child({
    service: "test:auto:models",
    inspect_depth: 5
}); */
const dbUser = require("../../../../services/db/dbUser");
const dbRole = require("../../../../services/db/dbRole");
const dbPermission = require("../../../../services/db/dbPermission");
const Permission = require('../../../../models/Permission');
const Role = require('../../../../models/Role');
const User = require('../../../../models/User');
// eslint-disable-next-line no-unused-vars
const logger = require('../../../../services/logger');

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

    describe("Permission", () => {
        it("Insert & Select All equals", async () => {
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

        it("Exist", async () => {
            const my_trial = permissions[Math.floor(Math.random() * permissions.length)]; // Choose random permission
            expect(await dbPermission.permissionExists(my_trial)).to.be.true;
            my_trial._id += 1; // Change id
            expect(await dbPermission.permissionExists(my_trial)).to.be.false;
            my_trial._id -= 1;

            let is_in = false;
            const perm = new Permission();
            perm.permission = "MiamChocolat";
            perm._id = 5;
            for (let i = 0; i < permissions.length; i++) {
                if (permissions[i].permission === perm.permission && permissions[i]._id === perm._id) {
                    is_in = true;
                }
            }
            expect(await dbPermission.permissionExists(perm)).to.be.equal(is_in);
        });

        it("Remove", async () => {
            const my_trial = permissions.pop(); // Choose and remove from array last permission

            await dbPermission.removePermission(my_trial);
            expect(await dbPermission.permissionExists(my_trial)).to.be.false;
        });
    });

    describe("Roles", () => {
        it("Roles Insert & Select All equals", async () => {
            roles = await seeder.generateRoles(15, permissions);
            const role1 = new Role();
            role1.name = "EmptyRole1";
            const role2 = new Role();
            role2.name = "EmptyRole2";
            roles.push(role1, role2);

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

        it("Exist", async () => {
            const my_trial = roles[Math.floor(Math.random() * roles.length)]; // Choose random role
            expect(await dbRole.roleExists(my_trial)).to.be.true;
            my_trial._id += 1; // Change id
            expect(await dbRole.roleExists(my_trial)).to.be.false;
            my_trial._id -= 1;

            let is_in = false;
            const rol = new Role();
            rol.name = "MiamChocolat";
            rol._id = 5;
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === rol.name && roles[i]._id === rol._id) {
                    is_in = true;
                }
            }
            expect(await dbRole.roleExists(rol)).to.be.equal(is_in);
        });

        it("getPermissionsFromRole", async () => {
            const my_trial = roles[Math.floor(Math.random() * roles.length)]; // Choose random role
            expect(await dbRole.getPermissionsFromRole(my_trial)).to.be.deep.equalInAnyOrder(my_trial.permissions);
        });

        it("Remove", async () => {
            const my_trial = roles.pop(); // Choose and remove from array last role

            await dbRole.removeRole(my_trial);
            expect(await dbRole.roleExists(my_trial)).to.be.false;
        });
    });

    describe("User", () => {
        it("Users Insert & Select All equals", async () => {
            users = await seeder.generateUsers(10, permissions, roles);

            const user1 = new User();
            user1.first_name = "EmptyUser1";
            const user2 = new User();
            user2.first_name = "EmptyUser2";
            user2.roles.push(roles[roles.length - 1]);
            const user3 = new User();
            user3.first_name = "EmptyUser3";
            users.push(user1, user2, user3);

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

        it("Exist", async () => {
            const my_trial = users[Math.floor(Math.random() * users.length)]; // Choose random user
            expect(await dbUser.userExists(my_trial)).to.be.true;
            my_trial._id += 100; // Change id
            expect(await dbUser.userExists(my_trial)).to.be.false;
            my_trial._id -= 100;

            let is_in = false;
            const use = new User();
            use._id = users.length + 1;
            for (let i = 0; i < users.length; i++) {
                if (users[i]._id === use._id) {
                    is_in = true;
                }
            }
            expect(await dbUser.userExists(use)).to.be.equal(is_in);
        });

        it("Remove", async () => {
            const my_trial = users.pop(); // Choose and remove from array last user

            await dbUser.removeUser(my_trial);
            expect(await dbUser.userExists(my_trial)).to.be.false;
        });
    });
});
