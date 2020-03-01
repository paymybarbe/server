// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require("faker");
const logger = require("../services/logger").child({
    service: "server:scripts:seeder"
});
const User = require("./../models/User");
const Permission = require("./../models/Permission");
const Role = require("./../models/Role");

const db_init = require("../services/db/db_init");

const dbUser = require("../services/db/dbUser");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");

async function main() {
    const start = Date.now();
    let last_time = start;
    let permissions = [];
    let perm_nbr = 0;
    let roles = [];
    let roles_nbr = 0;

    if (process.env.CLEAN) {
        await db_init.migrate('0')
            .then(() => {
                logger.debug(`Dumped all tables in ${(Date.now() - start) / 1000} seconds.`);
                last_time = Date.now();
            })
            .then(() => db_init.migrate()
                .then(() => {
                    logger.debug(`Recreated all tables in ${(Date.now() - last_time) / 1000} seconds.`);
                    last_time = Date.now();
                })
                .catch((err) => logger.error(err)))
            .catch((err) => logger.error(err));
    }

    try {
        permissions = await dbPermission.getAllPermissions();
        perm_nbr = permissions.length;
    }
    catch (err) {
        logger.error("Error getting all permissions: ", err);
    }

    try {
        roles = await dbRole.getAllRoles();
        roles_nbr = roles.length;
    }
    catch (err) {
        logger.error("Error getting all roles: ", err);
    }

    if (process.env.PERMISSIONS) {
        const permission_adding = [];
        for (let i = 0; i < process.env.PERMISSIONS; i++) {
            const permission = new Permission();
            permission.permission = faker.random.word();
            let j = 0;
            while (permissions.filter((p) => p === permission.permission).length !== 0 && j < 20) {
                permission.permission = faker.random.word();
                j++;
            }
            if (j > 20) {
                break;
            }
            permission.description = faker.lorem.sentence();
            permission_adding.push(dbPermission.addPermission(permission)
                .then((perm_ret) => {
                    permissions.push(perm_ret);
                })
                .catch((err) => {
                    if (err.code !== '23505') {
                        logger.error("Error adding permissions: ", permission, err);
                    }
                }));
        }

        await (Promise.all(permission_adding)
            .then(() => {
                logger.debug(`Finished seeding ${permissions.length - perm_nbr} permissions in ${(Date.now() - last_time) / 1000} seconds.`);
                last_time = Date.now();
            })
            .catch((ex) => logger.error(ex)));
    }

    if (process.env.ROLES) {
        const role_adding = [];
        for (let i = 0; i < process.env.ROLES; i++) {
            const role = new Role();
            role.name = faker.name.jobTitle();
            let j = 0;
            while (roles.filter((p) => p === role.role).length !== 0 && j < 20) {
                role.name = faker.name.jobTitle();
                j++;
            }
            if (j > 20) {
                break;
            }
            if (roles.length > 0) {
                role.parent_role = Math.random() > 0.3
                    ? roles[Math.floor(Math.random() * roles.length)]._id : null;
                role.next_role = Math.random() > 0.3
                    ? roles[Math.floor(Math.random() * roles.length)]._id : null;
            }

            role.permissions = [];
            if (permissions.length > 0) {
                for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                    const the_perm = permissions[Math.floor(Math.random() * permissions.length)];
                    if (role.permissions.filter(
                        (perm) => perm.permission === the_perm.permission
                    ).length === 0) {
                        role.permissions.push(the_perm);
                    }
                }
            }
            role_adding.push(dbRole.addRole(role)
                .then((role_ret) => {
                    roles.push(role_ret);
                })
                .catch((err) => {
                    if (err.code !== '23505') {
                        logger.error("Error adding roles: ", role, err);
                    }
                }));
        }

        await (Promise.all(role_adding)
            .then(() => {
                logger.debug(`Finished seeding ${roles.length - roles_nbr} roles in ${(Date.now() - last_time) / 1000} seconds.`);
                last_time = Date.now();
            })
            .catch((ex) => logger.error(ex)));
    }

    if (process.env.USERS) {
        const user_adding = [];

        for (let i = 0; i < process.env.USERS; i++) {
            const the_user = new User();
            the_user.first_name = faker.name.firstName();
            the_user.last_name = faker.name.lastName();
            the_user.solde = Math.round(Math.random() * 10100) / 100;
            the_user.points = Math.floor(Math.random() * 101);
            the_user.pseudo = faker.internet.userName();
            the_user.email = faker.internet.email();
            the_user.pass = faker.internet.password();
            the_user.date_of_birth = faker.date.past();
            the_user.created_at = faker.date.recent();
            the_user.active = Math.random() > 0.5;

            the_user.tags = [];
            for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
                the_user.tags.push(faker.random.alphaNumeric(32));
            }

            the_user.roles = [];


            // if (permissions.length !== 0) {
            //     for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
            //         the_user.tags.push(faker.random.alphaNumeric(32));
            //     }
            // }

            user_adding.push(dbUser.addUser(the_user).then().catch((err) => logger.error("Error adding users: ", err)));
        }

        await (Promise.all(user_adding)
            .then(() => {
                logger.debug(`Finished seeding ${process.env.USERS} users in ${(Date.now() - last_time) / 1000} seconds.`);
                last_time = Date.now();
            })
            .catch((ex) => logger.error(ex)));
    }

    await db_init.getPool().end().then(() => {
        const millis = Date.now() - start;
        logger.debug(`Seeding finished in ${Math.floor(millis / 10) / 100} seconds.`);
    }).catch((err) => logger.debug(err));
}

main().then(() => {});
