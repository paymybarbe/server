module.exports = class User {
    /**
     * ID of the database's column
     * @type {number}
     */
    id;
    first_name;
    last_name;
    solde = 0;
    points = 0;
    pseudo;
    email;
    hashed_pass;
    salt;
    date_of_birth;
    image;
    created_at;
    active;
};
