/* eslint-disable no-console */
const { migrate } = require("../services/db/dbinit");
// This script is used only to migrate DB via npm, not in the app.

if (!process.env.MIGRATE) {
    migrate();
    console.log("Migration to last finished.");
}
else {
    migrate(process.env.MIGRATE);
    console.log("Migration to ", process.env.MIGRATE, " finished.");
}
