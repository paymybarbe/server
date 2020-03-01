// eslint-disable-next-line import/no-extraneous-dependencies
const faker = require("faker");
const User = require("./../models/User");
const db_init = require("../services/db/db_init");
const dbUser = require("../services/db/dbUser");
const logger = require("../services/logger").child({
    service: "server:services:db:dbUser"
});

const start = Date.now();
const promises = [];
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

        user_adding.push(dbUser.addUser(the_user).then().catch((err) => logger.error("Error adding users: ", err)));
    }
    promises.push(Promise.all(user_adding)
        .then(() => logger.debug(`Finished seeding ${process.env.USERS} users`)));
}

Promise.all(promises).then(() => db_init.getPool().end().then(() => {
    const millis = Date.now() - start;
    logger.debug(`Seeding finished in ${Math.floor(millis / 1000)} seconds.`);
}).catch((err) => logger.debug(err)));
