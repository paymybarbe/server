const db_init = require("../db/db_init");
const logger = require("../logger").child({
    service: "server:services:db:dbUser"
});
const User = require("../../models/User");

const pool = db_init.getPool();

/**
 * Get all users from the database.
 * @return {User[]}
 */
async function getAllUsers() { // TODO: THIS
    const {
        rows
    } = await pool.query("SELECT * FROM users");
    const user = new User();
    user._id = rows[0].id;
}

/**
 * Add a user. Do the work itself for the password. It will not add transactions anywhere.
 * @param {User} user
 */
async function addUser(user) {
    if (!user) {
        logger.error("User was undefined: can't add user.");
        return;
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
        + "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";

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

        await client.query('DELETE FROM tags WHERE user_id = $1', [user_ret._id]);

        const promises = []; // array of promises to know when everything is done.
        user.tags.forEach((tag) => promises.push(client.query('INSERT INTO tags (user_id, tag_id) VALUES ($1, $2)', user._id, tag)));
        // TODO: dbRole, completer cette fonction...

        await Promise.all(promises);
        await client.query('COMMIT');
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
