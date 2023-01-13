import { Database } from "../driverDb/database.js";
import { Response } from "../models/response.js";
import {validateColumn} from "../utils/utils.js";

export default new class ThreadRepository {
    constructor() {
        this.dbcon = Database;
    }

    async createThread(thread, forum, user) {
        const response = new Response();

        try {
            await this.dbcon.db.none('UPDATE forums SET threads = threads + 1 WHERE slug = $1', forum.props.slug);
            await this.dbcon.db.none('INSERT INTO forum_users (forum_slug, user_id) VALUES ($1, (SELECT id FROM users WHERE nickname = $2)) ON CONFLICT DO NOTHING', [forum.props.slug, user.props.nickname]);
            response.props.body  = await this.dbcon.db.one('INSERT INTO threads (slug, author, author_id, forum, created, title, message) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, slug, author, forum, created, title, message, votes',
                [
                    thread.props.slug,
                    user.props.nickname,
                    user.props.id,
                    forum.props.slug,
                    thread.props.created,
                    thread.props.title,
                    thread.props.message,
                ]);
            response.props.status = 201;
        } catch (e) {
            response.props.status = 500;
            response.props.body = { message: e.message };
        }

        return response;
    }

    async getThread(type, value) {
        try {
            return await this.dbcon.db.oneOrNone(`SELECT id, slug, author, forum, created, title, message, votes FROM threads WHERE ${type} = $1`, value)
        } catch {}
    }

    async updateThread(id, thread) {
        try {
            const column_set = new this.dbcon.pgp.helpers.ColumnSet([
                validateColumn('message'), validateColumn('title')
            ], { table: 'threads' });

            let query = this.dbcon.pgp.helpers.update(thread.props, column_set, null, { emptyUpdate: true });

            if (query === true) {
                return true;
            } else {
                query += `WHERE id = ${id} RETURNING *`;
            }
            return await this.dbcon.db.oneOrNone(query);
        } catch {}
    }

    async getForumThread(params, slug) {
        const { since, desc, limit } = params;
        let request = 'select id, title, author, forum, message, votes, slug, created from threads where lower(forum) = lower($1) ';

        if (since) {
            if (desc) {
                request += 'and created <= $2 ';
            } else {
                request += 'and created >= $2 ';
            }
        }

        if (desc) {
            request += 'order by created desc ';
        } else {
            request += 'order by created asc ';
        }

        if (limit > -1) {
            request += 'limit $3 ';
        }

        try {
            return await this.dbcon.db.manyOrNone(request, [slug, since, limit]);
        } catch (e) {
        }
    }

    async createVote(voice, user, type, value) {
        const response = new Response();

        const request = type === 'id' ? 'VALUES ($3, $2, $1)' : 'SELECT $3, threads.id, $1 FROM threads WHERE threads.slug = $2';
        const requestUptVotes = type === 'id' ? '$2' : '(SELECT threads.id FROM threads WHERE threads.slug = $2)';

        let id_thread;
        try{
            id_thread = await this.dbcon.db.one(`SELECT id FROM threads WHERE ${type} = $1`, value);
        } catch(e) {
            response.props.status = 404;
            return response
        }
        
        const current_voice = await this.dbcon.db.oneOrNone(`SELECT voice FROM votes WHERE nickname = $1 AND thread = $2`, [user, id_thread.id]);
        
        const subStr = (current_voice && current_voice !== voice)?`- ${current_voice.voice}`:'';
        await this.dbcon.db.none(`UPDATE threads SET votes = votes + $1 ${subStr} WHERE id = ${requestUptVotes}`, [voice, value, user]);

        try {
            const data = await this.dbcon.db.tx((t) => {
               return t.batch([
                   t.none(`INSERT INTO votes as vote (nickname, thread, voice) ${request} ON CONFLICT ON CONSTRAINT votes_user_thread_unique DO UPDATE SET voice = $1;`, [voice, value, user]),
                   t.one(`SELECT id, slug, author, forum, created, title, message, votes FROM threads WHERE ${type} = $1`, value),
               ]);
            });

            response.props.body = data[1];
            response.props.status = 200;
        } catch (e) {
            response.props.status = 500;
            response.props.body = e.message;
        }

        return response
    }

    async getCount() {
        try {
            const items = await this.dbcon.db.one(`SELECT count(id) FROM threads`);
            return items ? Number(items.count) : 1;
        } catch (error) {
        }
    }

    async clearAll() {
        try {
            return await this.dbcon.db.none(`TRUNCATE threads CASCADE`);
        } catch (error) {}
    }
}
