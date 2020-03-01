/* eslint-disable no-console */
const { migrate } = require("../services/db/db_init");
// This script is used only to migrate DB via npm, not in the app.

if (!process.env.MIGRATE) {
    migrate()
        .then(() => console.log("Migration to last finished."))
        .catch((err) => console.error(err));
}
else {
    migrate(process.env.MIGRATE)
        .then(() => console.log("Migration to ", process.env.MIGRATE, " finished."))
        .catch((err) => console.error(err));
}
