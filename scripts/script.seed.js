// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require("faker");
const logger = require("../services/logger").child({
    service: "server:scripts:seeder"
});
const config = require("../config/config");
const User = require("./../models/User");
const Permission = require("./../models/Permission");
const Role = require("./../models/Role");

const db_init = require("../services/db/db_init");

const dbUser = require("../services/db/dbUser");
const dbRole = require("../services/db/dbRole");
const dbPermission = require("../services/db/dbPermission");

async function cleanDB() {
    await db_init.migrate('0');
    await db_init.migrate();
}

async function generatePermissions(amount, permissions) {
    const permission_added = [];
    const name_used = [];
    if (permissions) {
        permissions.forEach((element) => {
            name_used.push(element.permission);
        });
    }
    for (let i = 0; i < amount; i++) {
        const permission = new Permission();
        permission.permission = faker.random.word();

        let j = 0;
        while (name_used.includes(permission.permission) && j < 20) {
            permission.permission = faker.random.word();
            j++;
        }
        if (j >= 20) {
            continue;
        }

        permission.description = faker.lorem.sentence();
        name_used.push(permission.permission);
        permission_added.push(permission);
    }
    return permission_added;
}

async function addPermissions(amount, permissions) {
    const permission_added = [];
    const perms = await generatePermissions(amount, permissions);
    perms.forEach((perm) => permission_added.push(dbPermission.addPermission(perm)));

    for (let i = 0; i < permission_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        permission_added[i] = await permission_added[i];
    }

    return permission_added;
}

async function generateRoles(amount, permissions, roles) {
    const role_added = [];
    const roles_used = [];
    if (roles) {
        roles.forEach((element) => {
            roles_used.push(element.name);
        });
    }
    for (let i = 0; i < amount; i++) {
        const role = new Role();
        role.name = faker.name.jobTitle();

        let j = 0;
        while (roles_used.includes(role.name) && j < 20) {
            role.name = faker.name.jobTitle();
            j++;
        }
        if (j >= 20) {
            break;
        }
        if (roles && roles.length > 0) {
            role.parent_role = Math.random() > 0.3
                ? roles[Math.floor(Math.random() * roles.length)]._id : null;
            role.next_role = Math.random() > 0.3
                ? roles[Math.floor(Math.random() * roles.length)]._id : null;
        }

        role.permissions = [];
        if (permissions && permissions.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_perm = permissions[Math.floor(Math.random() * permissions.length)];
                if (role.permissions.filter(
                    (perm) => perm.permission === the_perm.permission
                ).length === 0) {
                    role.permissions.push(the_perm);
                }
            }
        }
        role_added.push(role);
        roles_used.push(role.name);
    }
    return role_added;
}

async function addRoles(amount, permissions, roles) {
    const role_added = [];

    const rolling = await generateRoles(amount, permissions, roles);
    rolling.forEach((roller) => role_added.push(dbRole.addRole(roller)));

    for (let i = 0; i < role_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        role_added[i] = await role_added[i];
    }

    return role_added;
}

async function generateUsers(amount, permissions, roles) {
    const user_adding = [];

    for (let i = 0; i < amount; i++) {
        const the_user = new User();
        the_user.first_name = faker.name.firstName();
        the_user.last_name = faker.name.lastName();
        the_user.solde = Math.round(Math.random() * 10100) / 100;
        the_user.points = Math.floor(Math.random() * 101);
        the_user.pseudo = faker.internet.userName();
        the_user.email = faker.internet.email();
        the_user.date_of_birth = faker.date.past();
        the_user.created_at = faker.date.recent();
        the_user.active = Math.random() > 0.5;

        the_user.tags = [];
        for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
            the_user.tags.push(faker.random.alphaNumeric(32));
        }

        the_user.roles = [];

        if (roles.length > 0) {
            for (let d = 0; d < Math.floor(Math.random() * 5); d++) {
                const the_role = roles[Math.floor(Math.random() * roles.length)];
                if (the_user.roles.filter(
                    (role) => role._id === the_role._id
                ).length === 0) {
                    the_user.roles.push(the_role);
                }
            }
        }

        the_user.personnal_permissions = [];
        if (permissions.length !== 0) {
            for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
                const that_perm = permissions[Math.floor(Math.random() * permissions.length)];
                if (!the_user.personnal_permissions.includes(that_perm)) {
                    the_user.personnal_permissions.push();
                }
            }
        }

        // TODO: Add favorites

        user_adding.push(the_user);
    }
    return user_adding;
}

async function addUsers(amount, permissions, roles) {
    const user_added = [];
    const userings = await generateUsers(amount, permissions, roles);
    userings.forEach((user) => user_added.push(dbUser.addUser(user)));

    for (let i = 0; i < user_added.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        user_added[i] = await user_added[i];
    }
    logger.debug(user_added);

    return user_added;
}

async function main() {
    let permissions = [];
    let roles = [];
    logger.debug(`Running on database ${config.database.database}`);
    const start = Date.now();
    let last_time = start;

    if (process.env.CLEAN) {
        try {
            await cleanDB();
            logger.debug(`Dumped & Recreated all tables in ${(Date.now() - start) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    try {
        permissions = await dbPermission.getAllPermissions();
    }
    catch (err) {
        logger.error("Error getting all permissions: ", err);
    }

    try {
        roles = await dbRole.getAllRoles();
    }
    catch (err) {
        logger.error("Error getting all roles: ", err);
    }

    last_time = Date.now();

    if (process.env.PERMISSIONS) {
        try {
            const added_permissions = await addPermissions(process.env.PERMISSIONS, permissions);
            permissions = [...permissions, ...added_permissions];
            logger.debug(`Finished seeding ${added_permissions.length} `
                    + `permissions in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    if (process.env.ROLES) {
        try {
            const role_added = await addRoles(process.env.ROLES, permissions, roles);
            roles = [...roles, ...role_added];
            logger.debug(`Finished seeding ${role_added.length} `
                    + `roles in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    if (process.env.USERS) {
        try {
            const user_adding = await addUsers(process.env.USERS, permissions, roles);

            logger.debug(`Finished seeding ${user_adding.length} users `
                        + `in ${(Date.now() - last_time) / 1000} seconds.`);
            last_time = Date.now();
        }
        catch (err) {
            logger.error(err);
        }
    }

    await db_init.end().then(() => {
        const millis = Date.now() - start;
        logger.debug(`Seeding finished in ${Math.floor(millis / 10) / 100} seconds.`);
    }).catch((err) => logger.debug(err));
}

if (require.main === module) {
    main().then(() => {});
}

module.exports.generatePermissions = generatePermissions;
module.exports.addPermissions = addPermissions;
module.exports.generateRoles = generateRoles;
module.exports.addRoles = addRoles;
module.exports.generateUsers = generateUsers;
module.exports.addUsers = addUsers;
module.exports.cleanDB = cleanDB;
