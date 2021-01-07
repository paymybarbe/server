const chai = require('chai');
const { expect } = chai;
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const Permission = require('../../../../models/Permission');
const Role = require('../../../../models/Role');
const User = require('../../../../models/User');
const Product = require('../../../../models/Product');
// eslint-disable-next-line no-unused-vars
const logger = require('../../../../services/logger');

chai.use(deepEqualInAnyOrder);

describe("Models", function _test() {
    this.timeout(1000);

    describe("Product", () => {
        it("setRolePrice(), getRolePrice(), deleteRolePrice()", () => {
            const role1 = new Role();
            role1.name = "EmptyRole1";
            const role2 = new Role();
            role2.name = "EmptyRole2";
            role2._id = 2;

            const product = new Product();

            expect(product.getRolePrice.bind(product, role1)).to.throw();
            expect(product.setRolePrice.bind(product, role1, 100.05)).to.throw();
            expect(product.deleteRolePrice.bind(product, role1)).to.throw();

            role1._id = 1;
            product.setRolePrice(role1, 100.05);
            expect(product.getRolePrice(role1)).to.equal(100.05);
            expect(product.getRolePrice(role2)).to.equal(null);

            product.setRolePrice(role2, 380);
            expect(product.getRolePrice(role1)).to.equal(100.05);
            expect(product.getRolePrice(role2)).to.equal(380);

            product.setRolePrice(role1, 101.05);
            expect(product.getRolePrice(role1)).to.equal(101.05);
            expect(product.getRolePrice(role2)).to.equal(380);

            product.deleteRolePrice(role1);
            expect(product.getRolePrice(role1)).to.equal(null);
            expect(product.getRolePrice(role2)).to.equal(380);

            expect(product.deleteRolePrice.bind(product, role1)).to.not.throw();
        });
    });

    describe("User", () => {
        it("get permissions()", () => {
            const perm1 = new Permission();
            perm1.permission = "1";
            const perm2 = new Permission();
            perm2.permission = "2";
            const perm3 = new Permission();
            perm3.permission = "3";
            const perm4 = new Permission();
            perm4.permission = "4";
            const perm5 = new Permission();
            perm5.permission = "5";

            const role1 = new Role();
            const role2 = new Role();
            const role3 = new Role();
            const role4 = new Role();

            role1.permissions.push(perm1);
            role2.permissions.push(perm2, perm3);
            role3.permissions.push(perm1, perm2, perm4);

            const user = new User();

            expect(user.permissions).to.be.empty;

            user.roles.push(role1);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1]);

            user.roles.push(role2);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3]);

            user.roles.push(role3);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3, perm4]);

            user.roles.push(role4);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3, perm4]);

            user.personnal_permissions.push(perm1);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3, perm4]);

            user.personnal_permissions.push(perm5);
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3, perm4, perm5]);

            user.roles.pop();
            user.roles.pop();
            expect(user.permissions).to.be.deep.equalInAnyOrder([perm1, perm2, perm3, perm5]);
        });
    });
});
