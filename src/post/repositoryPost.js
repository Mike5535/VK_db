import { Database } from "../driverDb/database.js";
import { Response } from "../models/response.js";
import { ModelPost } from "../models/modelPost.js";

export default new class PostRepository {
    constructor() {
        this.dbcon = Database;
    }

    async createPost(posts, thread) {
       const response = new Response();

       const time = new Date();

       for (let i = 0; i < posts.length; i++) {
           if (posts[i].parent) {
               const parent = await this.dbcon.db.oneOrNone('SELECT id FROM posts WHERE id = $1 AND thread_id = $2', [posts[i].parent, thread.props.id]);
               if (!parent) {
                   response.props.status = 409;
                   return response;
               }
           }
       }

       let users;

       try {
           users = await this.dbcon.db.tx((t) => {
               const queries_users = posts.map((item) => {
                   return t.one('select id, nickname from users where nickname = $1', [item.author]);
               });
               return t.batch(queries_users);
           });

       } catch (e) {
           response.props.body = e.message;
           response.props.status = 404;
           return response;
       }

        const values = posts.map((item, index) => {
            const parent = item.parent ? item.parent : 0;
            return {
                author: users[index].nickname,
                author_id: users[index].id,
                forum_slug: thread.props.forum,
                thread_id: thread.props.id,
                created: time,
                message: item.message,
                parent_id: parent,
            }
        });

        const cs = new this.dbcon.pgp.helpers.ColumnSet(
            ['author', 'author_id', 'forum_slug', 'thread_id', 'created', 'message', 'parent_id']
            ,{ table: 'posts'});
        const query = this.dbcon.pgp.helpers.insert(values, cs) +
            ' RETURNING id';


        try {
            const ids = await this.dbcon.db.many(query);

            response.props.body = values.map((item, index) => {
                return {
                    id: ids[index].id,
                    author: item.author,
                    edited: false,
                    created: item.created,
                    message: item.message,
                    parent_id: item.parent_id,
                    forum_slug: item.forum_slug,
                    thread_id: item.thread_id,
                }
            });

            response.props.status = 201;
        } catch (e) {
            response.props.status = 409;
            response.props.body = e.message;
        }

       return response;
    }

    async updatePost(post) {
        const response = new Response();
        try {
            const data = await this.dbcon.db.one('UPDATE posts SET (message, edited) = (coalesce($1, message), coalesce(message <> $1, edited)) WHERE id = $2 RETURNING id, author, created, message, parent_id, edited, forum_slug, thread_id', [post.props.message, post.props.id]);
            response.props.body = ModelPost.serialize(data);
            response.props.status = 200;
        } catch (e) {
            response.props.status = 500;
            response.props.body = { message: e.message };
        }
        return response;
    }

    async getPostById(id) {
        try {
            return await this.dbcon.db.oneOrNone('SELECT id, author, created, message, parent_id, forum_slug, edited, thread_id FROM posts WHERE id = $1', id);
        } catch  {}
    }

    async getPostByThreadId(sort, id, params) {
        let { limit, since, desc } = params;

        let query = 'select posts.id, posts.created, posts.thread_id, posts.forum_slug, ' +
            'posts.author, posts.message, posts.parent_id, posts.path from posts ';
        const sign = desc ? '<' : '>';

        desc = desc ? 'desc' : 'asc';

        switch (sort) {
            case 'tree':
                if (since) {
                    query += `where posts.path ${sign} (select posts.path from posts where posts.id = $3) 
                        and posts.thread_id = $1 order by posts.path ${desc}, posts.created, posts.id limit $2`;
                } else {
                    query += `where posts.thread_id = $1 order by posts.path ${desc}, posts.created, posts.id limit $2;`
                }
                break;
            case 'parent_tree':
                if (since) {
                    if (desc === 'asc') {
                        query += `join (select posts.path[1] as root from posts where posts.thread_id = $1 and posts.path[1] >
                    (select posts.path[1] from posts where posts.id = $3) and array_length(posts.path, 1) = 1 order by root limit $2) 
                    root_posts on posts.path[1] = root_posts.root order by posts.path, posts.created, posts.id`;
                    } else {
                        query += `join (select posts.path[1] as root from posts where posts.thread_id = $1 and posts.path[1] <
                    (select posts.path[1] from posts where posts.id = $3) and array_length(posts.path, 1) = 1 order by root desc limit $2) 
                    root_posts on posts.path[1] = root_posts.root order by posts.path[1] desc, posts.path[2:], posts.created, posts.id`;
                    }
                } else {
                    query += `where posts.path[1] in 
                    (select distinct posts.path[1] from posts where posts.thread_id = $1 and 
                    array_length(posts.path, 1) = 1 order by posts.path[1] ${desc} limit $2) 
                    order by posts.path[1] ${desc}, posts.path, posts.created, posts.id`;
                }
                break;
            default:
                if (since) {
                    query += `where posts.thread_id = $1 and posts.id ${sign} $3 order by posts.created ${desc}, posts.id ${desc} limit $2`;
                } else {
                    query += `where posts.thread_id = $1 order by posts.created ${desc}, posts.id ${desc} limit $2`;
                }
                break;
        }
        return await this.dbcon.db.manyOrNone(query, [id, limit, since]);
    }

    async getCount() {
        try {
            const items = await this.dbcon.db.one(`SELECT count(id) FROM posts`);
            return items ? Number(items.count) : 1;
        } catch (error) {
        }
    }

    async clearAll() {
        try {
            return await this.dbcon.db.none(`TRUNCATE posts CASCADE`);
        } catch (error) {}
    }
}
