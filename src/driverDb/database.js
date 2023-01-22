import promise from 'bluebird';
import pgPromise from 'pg-promise';

export const pgp = pgPromise({
    capSQL: true,
    promiseLib: promise,
});

class Db {
    constructor() {
        this.pgp = pgp;
        this.db = pgp('postgres://docker:docker@localhost:5432/docker');
    }
}

export const Database = new Db();
