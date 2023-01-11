import { ModelForum } from "../models/modelForum.js";
import { Response } from "../models/response.js";
import { Database } from "../driverDb/database.js";

export default new class ForumRepository {
    constructor() {
        this.dbcon = Database;
    }

    async createForum(forum, user) {
        const response = new Response();
        const { slug, title } = forum.props;
        const { id, nickname } = user.props;

        try {
            const data = await this.dbcon.db.one('INSERT INTO forums (slug, title, nickname) VALUES ($1, $2, $3) RETURNING id, slug, title, nickname, posts, threads',[slug, title,nickname]);
            response.props.body = ModelForum.serialize(data);
            response.props.status = 201;
        } catch (e) {
            response.props.status = 500;
            response.props.body = { message: e.message };
        }

        return response
    }

    async getById(id) {
        try {
            return await this.dbcon.db.oneOrNone(`SELECT id, slug, title, nickname, posts, threads FROM forums WHERE id = $1`, id);
        } catch  {}
    }

    async getBySlug(slug) {
        try {
            return await this.dbcon.db.oneOrNone(`SELECT id, slug, title, nickname, posts, threads FROM forums WHERE slug = $1`, slug);
        } catch  {}
    }

    async addPostsCount(slug, count) {
        const response = new Response();

        try {
            await this.dbcon.db.none('UPDATE forums SET posts = posts + $1 WHERE slug = $2', [count, slug]);
            response.props.status = 200;
        } catch (e) {
            response.props.status = 500;
        }

        return response;
    }

    async addThreadCount(id, count) {
        const response = new Response();
        count = !count ? 1 : count;

        try {
            await this.dbcon.db.none('UPDATE forums SET threads = threads + $1 WHERE id = $2', [count, id]);
            response.props.status = 200;
        } catch (e) {
            response.props.status = 500;
            response.props.body = { message: e.message };
        }

        return response;
    }

    async getCount() {
        try {
            const items = await this.dbcon.db.one(`SELECT count(id) FROM forums`);
            return items ? Number(items.count) : 1;
        } catch (error) {
        }
    }

    async clearAll() {
        try {
            return await this.dbcon.db.none(`TRUNCATE forums CASCADE`);
        } catch (error) {}
    }
}
