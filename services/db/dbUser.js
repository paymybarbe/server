const db_init = require("./db_init");
const logger = require("../logger").child({
    service: "server:services:db:dbUser"
});
const User = require("../../models/User");
const pool = db_init.getPool();

/**
 * Get all users from the database.
 * @return {User[]}
 */
async function getAllUsers() { // TODO: THIS ENTIRE FUCKING FUNCTION
    const queryText = "SELECT users.*, array_agg(tags.tag_id) AS tags FROM users "
                    + "LEFT JOIN tags ON users.id = tags.user_id "
                    + "GROUP BY users.id, tags.user_id;";
    const {
        rows
    } = await pool.query(queryText);

    const users = [];
    rows.forEach((row) => {
        const user = new User();
        user._id = row.id;
        user.first_name = row.first_name;
        user.last_name = row.last_name;
        user.solde = row.solde;
        user.points = row.points;
        user.pseudo = row.pseudo;
        user.email = row.email;
        user.date_of_birth = row.date_of_birth;
        user.created_at = row.created_at;
        user.active = row.active;

        if (row.tags[0] === null) {
            user.tags = [];
        }
        else {
            user.tags = row.tags;
        }

        users.push(user);
    });
    return users;
}

/**
 * Add a user. Do the work itself for the password. It will not add transactions anywhere.
 * return the user added.
 * @param {User} user
 * @returns {User}
 */
async function addUser(user) {
    if (!user) {
        logger.error("User was undefined: can't add user.");
        return undefined;
    }
    const user_ret = JSON.parse(JSON.stringify(user));
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = "INSERT INTO users (first_name, "
                                            + "last_name, "
                                            + "solde, "
                                            + "points, "
                                            + "pseudo, "
                                            + "email, "
                                            + "date_of_birth, "
                                            + "image, "
                                            + "last_logged, "
                                            + "active) "
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;";

        const params = [
            user.first_name,
            user.last_name,
            user.solde,
            user.points,
            user.pseudo,
            user.email,
            user.date_of_birth,
            user.image,
            user.last_logged,
            user.active
        ];

        const res = await client.query(queryText, params);
        user_ret._id = res.rows[0].id;

        const promises = []; // array of promises to know when everything is done.

        if (user.tags) {
            user.tags.forEach((tag) => {
                promises.push(
                    client.query('INSERT INTO tags (user_id, tag_id) VALUES ($1, $2)', [user_ret._id, tag])
                );
            });
        }
        // TODO: dbRole, completer cette fonction...

        await Promise.all(promises);
        await client.query('COMMIT');

        return user_ret;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}

module.exports.getAllUsers = getAllUsers;
module.exports.addUser = addUser;
