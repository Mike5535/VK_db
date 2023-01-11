const promise = require('bluebird');

export const pgp = require('pg-promise')({
    capSQL: true,
    promiseLib: promise,
});

export default new class Database {
    constructor() {
        this.pgp = pgp;
        this.db = pgp('postgres://docker:docker@localhost:5535/docker');
    }
}
