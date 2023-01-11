import { Response } from "../models/response.js";
import { Database } from "../driverDb/database.js";
import { validateColumn } from "../utils/utils.js";

export default new class RepositoryUser {
    constructor() {
        this.dbcon = Database;
    }

    async create(user) {
        const result = new Response();
        const { fullname, email, about, nickname } = user.props;

        try {
            await this.dbcon.db.none(`INSERT INTO users (nickname, about, fullname, email) VALUES ($1, $2, $3, $4)`, [nickname, about, fullname, email]);
            result.update({ status: 201, body: user.props });
        } catch (error) {
            console.log(error);
            result.update({ status: 500, body: { message: error.message } });
        }

        return result
    };

    async getByNickname(nickname) {
        try {
            return await this.dbcon.db.oneOrNone(`SELECT id, nickname, fullname, email, about FROM users WHERE nickname = $1`, nickname);
        } catch {
        }
    }

    async update(user) {
        try {
            const column_set = new this.dbcon.pgp.helpers.ColumnSet([
                validateColumn('nickname'), validateColumn('about'),
                validateColumn('fullname'), validateColumn('email')
            ], {table: 'users'});

            let query = this.dbcon.pgp.helpers.update(
                user.props,
                column_set,
                null,
                {emptyUpdate: true}
            );

            if (query === true) {
                return true;
            } else {
                query += ` WHERE \"nickname\" = \'${user.props.nickname}\' RETURNING nickname, fullname, about, email`;
            }

            return await this.dbcon.db.oneOrNone(query);

        } catch {
        }
    }

    async getUsersByNicknameOrEmail(nickname, email) {
        try {
            return await this.dbcon.db.manyOrNone(`SELECT nickname, email, about, fullname FROM users WHERE nickname = $1 OR email = $2`, [nickname, email]);
        } catch {
        }
    }

    async getUsersFromForum(forum, params) {
        let { limit, since, desc } = params;
        let query = 'select users.id, users.nickname, users.fullname, users.about, users.email from users join forum_users on forum_users.user_id = users.id where forum_users.forum_slug = $1';

        const order = desc && !!desc ? 'desc' : 'asc';
        const sign = desc && !!desc ? '<' : '>';
        limit = limit ? limit : null;

        if (since) {
            query += ` AND nickname ${sign} '${since}' `
        }

        query += ` ORDER BY nickname ${order} LIMIT ${limit}`;

        try {
            return await this.dbcon.db.manyOrNone(query, forum);
        } catch {}
    }


    async getCount() {
        try {
            const items = await this.dbcon.db.one(`SELECT count(id) FROM users`);
            return items ? Number(items.count) : 1;
        } catch (error) {
        }
    }

    async clearAll() {
        try {
            return await this.dbcon.db.none(`TRUNCATE users CASCADE`);
        } catch (error) {}
    }
}
