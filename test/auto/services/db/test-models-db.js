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
const dbProduct = require("../../../../services/db/dbProduct");
const dbRole = require("../../../../services/db/dbRole");
const dbPermission = require("../../../../services/db/dbPermission");
const Permission = require('../../../../models/Permission');
const Role = require('../../../../models/Role');
const Product = require('../../../../models/Product');
const User = require('../../../../models/User');
// eslint-disable-next-line no-unused-vars
const logger = require('../../../../services/logger');

chai.use(deepEqualInAnyOrder);
chai.use(require('chai-as-promised'));

describe("Models From Database", function _test() {
    this.timeout(1000);
    let permissions;
    let roles;
    let products;
    let users;
    let trial_id;

    this.beforeAll(async () => {
        permissions = await dbPermission.getAllPermissions();
        roles = await dbRole.getAllRoles();
        users = await dbUser.getAllUsers();
        products = await dbProduct.getAllProducts();
    });

    this.afterAll(async () => {
        await dbinit.end();
    });

    function sortId(a, b) {
        return a._id - b._id;
    }

    describe("Permission", () => {
        it("Insert & Select All equals", async () => {
            const new_permissions = await seeder.generatePermissions(30, permissions);
            const select_permissions = [];
            new_permissions.forEach((element) => {
                select_permissions.push(dbPermission.addPermission(element));
            });

            const add_perms = await Promise.all(select_permissions);
            const sel_perms = await dbPermission.getAllPermissions();

            add_perms.push(...permissions);

            expect(sel_perms).to.have.length(add_perms.length);

            sel_perms.sort(sortId);
            add_perms.sort(sortId);
            for (let i = 0; i < add_perms.length; i++) {
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
            const new_roles = await seeder.generateRoles(15, permissions, roles);
            const role1 = new Role();
            role1.name = "EmptyRole1";
            const role2 = new Role();
            role2.name = "EmptyRole2";
            new_roles.push(role1, role2);

            const select_roles = [];
            new_roles.forEach((element) => {
                select_roles.push(dbRole.addRole(element));
            });

            const add_roles = await Promise.all(select_roles);
            const sel_rollings = await dbRole.getAllRoles();

            add_roles.push(...roles);

            expect(sel_rollings).to.have.length(add_roles.length);

            add_roles.sort(sortId);
            sel_rollings.sort(sortId);
            for (let i = 0; i < add_roles.length; i++) {
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
            my_trial._id += roles.length; // Change id
            expect(await dbRole.roleExists(my_trial)).to.be.false;
            my_trial._id -= roles.length; // Change back id
        });

        it("Update", async () => {
            trial_id = Math.floor(Math.random() * roles.length);
            const my_trial = roles[trial_id]; // Choose random role
            my_trial.name = "UpdatedRole";
            my_trial.next_role = roles[Math.floor(Math.random() * roles.length)]._id; // Choose random role
            // Prevent it from being the last one as we will delete it just after
            my_trial.next_role = my_trial.next_role === roles[roles.length - 1]._id ? null : my_trial.next_role;
            my_trial.parent_role = null;

            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_perm = permissions[Math.floor(Math.random() * permissions.length)];
                if (my_trial.permissions.filter(
                    (perm) => perm.permission === the_perm.permission
                ).length === 0) {
                    my_trial.permissions.push(the_perm);
                }
            }

            await dbRole.updateRole(my_trial);
            const trial_in = await dbRole.getRole(my_trial);

            expect(my_trial.name).to.be.equal(trial_in.name);
            expect(my_trial.description).to.be.equal(trial_in.description);
            my_trial.permissions.sort(sortId);
            trial_in.permissions.sort(sortId);
            expect(my_trial.permissions).to.be.eql(trial_in.permissions);
            expect(my_trial.parent_role).to.be.equal(trial_in.parent_role);
            expect(my_trial.next_role).to.be.equal(trial_in.next_role);
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

    describe("Products", () => {
        it("Insert & Select All equals", async () => {
            const new_products = await seeder.generateProducts(50, roles);

            const product1 = new Product();
            product1.name = "EmptyProduct1";
            new_products.push(product1);

            const select_products = [];
            new_products.forEach((element) => {
                select_products.push(dbProduct.addProduct(element));
            });

            const add_products = await Promise.all(select_products);
            const sel_uss = await dbProduct.getAllProducts();

            add_products.push(...products);

            expect(add_products).to.have.length(sel_uss.length);
            add_products.sort(sortId);
            sel_uss.sort(sortId);
            for (let i = 0; i < add_products.length; i++) {
                expect(add_products[i]).to.be.deep.equalInAnyOrder(sel_uss[i]);
            }

            products = add_products;
        });

        it("Update", async () => {
            const my_trial = products[Math.floor(Math.random() * products.length)]; // Choose random product
            // Change several values
            my_trial.name = "Miam";
            my_trial.cost_price = 12345;

            let my_role = null;

            if (roles.length > 2) {
                my_role = roles[Math.floor(Math.random() * roles.length)]; // Choose random product
                my_trial.setRolePrice(my_role, 54321.01);
            }

            await dbProduct.updateProduct(my_trial);
            const my_checker = await dbProduct.getProduct(my_trial);
            // Check if product was updated with our changes
            expect(my_trial).to.be.deep.equalInAnyOrder(my_checker);
        });

        it("Exist", async () => {
            const my_trial = products[Math.floor(Math.random() * products.length)]; // Choose random product
            expect(await dbProduct.productExists(my_trial)).to.be.true;
            my_trial._id += 100; // Change id
            expect(await dbProduct.productExists(my_trial)).to.be.false;
            my_trial._id -= 100;

            let is_in = false;
            const use = new Product();
            use._id = products.length + 1;
            for (let i = 0; i < products.length; i++) {
                if (products[i]._id === use._id) {
                    is_in = true;
                }
            }
            expect(await dbProduct.productExists(use)).to.be.equal(is_in);
        });

        it("Remove", async () => {
            const my_trial = products.pop(); // Choose and remove from array last product
            expect(await dbProduct.productExists(my_trial)).to.be.true;
            await dbProduct.removeProduct(my_trial);
            expect(await dbProduct.productExists(my_trial)).to.be.false;
        });

        it("setCostPrice() & getCostPrice()", async () => {
            const my_trial = new Product();
            my_trial.name = "CostPriceTest";

            await expect(dbProduct.getCostPrice()).to.be.rejectedWith(Error);
            await expect(dbProduct.getCostPrice(my_trial)).to.be.rejectedWith(Error);

            await dbProduct.addProduct(my_trial);
            const right_now = new Date();
            expect(await dbProduct.getCostPrice(my_trial)).to.equal(0);
            expect(await dbProduct.getCostPrice(my_trial, right_now)).to.equal(0);

            await dbProduct.setCostPrice(my_trial, 1);
            expect(await dbProduct.getCostPrice(my_trial)).to.equal(1);
            expect(await dbProduct.getCostPrice(my_trial, right_now)).to.equal(0);
            expect(await dbProduct.getCostPrice(my_trial, new Date())).to.equal(1);

            const before_now2 = new Date();
            before_now2.setDate(right_now.getDate() - 2);
            const before_now3 = new Date();
            before_now3.setDate(right_now.getDate() - 1);

            await dbProduct.setCostPrice(my_trial, 3, before_now2);
            await dbProduct.setCostPrice(my_trial, 4, before_now3);
            expect(await dbProduct.getCostPrice(my_trial)).to.equal(1);
            expect(await dbProduct.getCostPrice(my_trial, right_now)).to.equal(4);
            expect(await dbProduct.getCostPrice(my_trial, new Date())).to.equal(1);
            expect(await dbProduct.getCostPrice(my_trial, before_now2)).to.equal(3);
            expect(await dbProduct.getCostPrice(my_trial, before_now3)).to.equal(4);

            before_now2.setTime(before_now2.getTime() + 60 * 60 * 1000);
            before_now3.setTime(before_now3.getTime() + 60 * 60 * 1000);
            expect(await dbProduct.getCostPrice(my_trial, before_now2)).to.equal(3);
            expect(await dbProduct.getCostPrice(my_trial, before_now3)).to.equal(4);
        });

        it("setMenuPrice() & getMenuPrice()", async () => {
            const my_trial = new Product();
            my_trial.name = "MenuPriceTest";

            await expect(dbProduct.getMenuPrice()).to.be.rejectedWith(Error);
            await expect(dbProduct.getMenuPrice(my_trial)).to.be.rejectedWith(Error);

            await dbProduct.addProduct(my_trial);
            const right_now = new Date();
            expect(await dbProduct.getMenuPrice(my_trial)).to.equal(0);
            expect(await dbProduct.getMenuPrice(my_trial, right_now)).to.equal(0);

            await dbProduct.setMenuPrice(my_trial, 1);
            expect(await dbProduct.getMenuPrice(my_trial)).to.equal(1);
            expect(await dbProduct.getMenuPrice(my_trial, right_now)).to.equal(0);
            expect(await dbProduct.getMenuPrice(my_trial, new Date())).to.equal(1);

            const before_now2 = new Date();
            before_now2.setDate(right_now.getDate() - 2);
            const before_now3 = new Date();
            before_now3.setDate(right_now.getDate() - 1);

            await dbProduct.setMenuPrice(my_trial, 3, before_now2);
            await dbProduct.setMenuPrice(my_trial, 4, before_now3);
            expect(await dbProduct.getMenuPrice(my_trial)).to.equal(1);
            expect(await dbProduct.getMenuPrice(my_trial, right_now)).to.equal(4);
            expect(await dbProduct.getMenuPrice(my_trial, new Date())).to.equal(1);
            expect(await dbProduct.getMenuPrice(my_trial, before_now2)).to.equal(3);
            expect(await dbProduct.getMenuPrice(my_trial, before_now3)).to.equal(4);

            before_now2.setTime(before_now2.getTime() + 60 * 60 * 1000);
            before_now3.setTime(before_now3.getTime() + 60 * 60 * 1000);
            expect(await dbProduct.getMenuPrice(my_trial, before_now2)).to.equal(3);
            expect(await dbProduct.getMenuPrice(my_trial, before_now3)).to.equal(4);
        });

        it("setRankedPrice() & getRankedPrices()", async () => {
            const my_trial = new Product();
            const role1 = new Role();
            role1.name = "getPrice1";
            const role2 = new Role();
            role2.name = "getPrice2";

            my_trial.name = "RankedPriceTest";

            await expect(dbProduct.getRankedPrices()).to.be.rejectedWith(Error);
            await expect(dbProduct.getRankedPrices(my_trial)).to.be.rejectedWith(Error);
            await expect(dbProduct.getRankedPrices(my_trial, 100)).to.be.rejectedWith(Error);
            await expect(dbProduct.getRankedPrices(my_trial, 100, role1)).to.be.rejectedWith(Error);

            await dbProduct.addProduct(my_trial);
            const right_now = new Date();
            expect(await dbProduct.getRankedPrices(my_trial)).to.be.empty;
            expect(await dbProduct.getRankedPrices(my_trial, right_now)).to.be.empty;

            await dbRole.addRole(role1);
            await dbProduct.setRankedPrice(my_trial, role1, 1.1);

            expect((await dbProduct.getRankedPrices(my_trial))[role1._id.toString()]).to.equal(1.1);
            expect(await dbProduct.getRankedPrices(my_trial, right_now)).to.be.empty;
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role1._id.toString()]).to.equal(1.1);

            await dbRole.addRole(role2);
            await dbProduct.setRankedPrice(my_trial, role2, 2.1);
            expect((await dbProduct.getRankedPrices(my_trial))[role1._id.toString()]).to.equal(1.1);
            expect(await dbProduct.getRankedPrices(my_trial, right_now)).to.be.empty;
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role1._id.toString()]).to.equal(1.1);
            expect((await dbProduct.getRankedPrices(my_trial))[role2._id.toString()]).to.equal(2.1);
            expect(await dbProduct.getRankedPrices(my_trial, right_now)).to.be.empty;
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role2._id.toString()]).to.equal(2.1);

            const before_now2 = new Date();
            before_now2.setDate(right_now.getDate() - 2);
            const before_now3 = new Date();
            before_now3.setDate(right_now.getDate() - 1);

            await dbProduct.setRankedPrice(my_trial, role1, 1.3, before_now2);
            await dbProduct.setRankedPrice(my_trial, role1, 1.4, before_now3);
            expect((await dbProduct.getRankedPrices(my_trial))[role1._id.toString()]).to.equal(1.1);
            expect((await dbProduct.getRankedPrices(my_trial, right_now))[role1._id.toString()]).to.equal(1.4);
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role1._id.toString()]).to.equal(1.1);
            expect((await dbProduct.getRankedPrices(my_trial, before_now2))[role1._id.toString()]).to.equal(1.3);
            expect((await dbProduct.getRankedPrices(my_trial, before_now3))[role1._id.toString()]).to.equal(1.4);

            await dbProduct.setRankedPrice(my_trial, role2, 2.3, before_now2);
            await dbProduct.setRankedPrice(my_trial, role2, 2.4, before_now3);
            expect((await dbProduct.getRankedPrices(my_trial))[role2._id.toString()]).to.equal(2.1);
            expect((await dbProduct.getRankedPrices(my_trial, right_now))[role2._id.toString()]).to.equal(2.4);
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role2._id.toString()]).to.equal(2.1);
            expect((await dbProduct.getRankedPrices(my_trial, before_now2))[role2._id.toString()]).to.equal(2.3);
            expect((await dbProduct.getRankedPrices(my_trial, before_now3))[role2._id.toString()]).to.equal(2.4);
            expect((await dbProduct.getRankedPrices(my_trial))[role1._id.toString()]).to.equal(1.1);
            expect((await dbProduct.getRankedPrices(my_trial, right_now))[role1._id.toString()]).to.equal(1.4);
            expect((await dbProduct.getRankedPrices(my_trial, new Date()))[role1._id.toString()]).to.equal(1.1);
            expect((await dbProduct.getRankedPrices(my_trial, before_now2))[role1._id.toString()]).to.equal(1.3);
            expect((await dbProduct.getRankedPrices(my_trial, before_now3))[role1._id.toString()]).to.equal(1.4);

            before_now2.setTime(before_now2.getTime() + 60 * 60 * 1000);
            before_now3.setTime(before_now3.getTime() + 60 * 60 * 1000);
            expect((await dbProduct.getRankedPrices(my_trial, before_now2))[role1._id.toString()]).to.equal(1.3);
            expect((await dbProduct.getRankedPrices(my_trial, before_now3))[role1._id.toString()]).to.equal(1.4);
            expect((await dbProduct.getRankedPrices(my_trial, before_now2))[role2._id.toString()]).to.equal(2.3);
            expect((await dbProduct.getRankedPrices(my_trial, before_now3))[role2._id.toString()]).to.equal(2.4);
        });
    });

    describe("User", () => {
        it("Users Insert & Select All equals", async () => {
            const new_users = await seeder.generateUsers(10, permissions, roles, products);

            const user1 = new User();
            user1.first_name = "EmptyUser1";
            const user2 = new User();
            user2.first_name = "EmptyUser2";
            user2.roles.push(roles[roles.length - 1]);
            const user3 = new User();
            user3.first_name = "EmptyUser3";
            if (trial_id < roles.length) {
                user3.roles.push(roles[trial_id]); // Updated role
            }
            new_users.push(user1, user2, user3);

            const select_users = [];
            new_users.forEach((element) => {
                select_users.push(dbUser.addUser(element));
            });

            const add_users = await Promise.all(select_users);
            const sel_uss = await dbUser.getAllUsers();

            add_users.push(...users);

            expect(add_users).to.have.length(sel_uss.length);
            add_users.sort(sortId);
            sel_uss.sort(sortId);
            for (let i = 0; i < add_users.length; i++) {
                try {
                    expect(add_users[i]).to.be.deep.equalInAnyOrder(sel_uss[i]);
                }
                catch (e) {
                    logger.debug(add_users[i]);
                    logger.debug(sel_uss[i]);
                    logger.debug(roles[trial_id]);
                    if (trial_id < roles.length) {
                        // eslint-disable-next-line no-await-in-loop
                        logger.debug(await dbRole.getRole(roles[trial_id]));
                    }
                    throw e;
                }
            }

            users = add_users;
        });

        it("Update", async () => {
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
            expect(await dbUser.userExists(my_trial)).to.be.true;
            await dbUser.removeUser(my_trial);
            expect(await dbUser.userExists(my_trial)).to.be.false;
        });
    });
});
