import { ModelForum } from "../models/modelForum.js";
import { ModelUser } from "../models/modelUser.js";
import UserRepository from '../user/repositoryUser.js';
import ThreadRepository from '../thread/repositoryThread.js';
import ForumRepository from './repositoryForum.js';
import { ModelThread } from "../models/modelThread.js";
import { isId } from "../utils/utils.js";

export default new class HandlerForum {

    async createForum(req, res) {
        const forum = new ModelForum(req.body);
        const user = new ModelUser({ nickname: forum.props.user });
        const temp = await UserRepository.getByNickname(user.props.nickname);

        if (!temp) {
            return res.code(404).send({ message: `Can't find user with nickname ${user.props.nickname}`});
        }

        user.update(temp);

        const dbForum = await ForumRepository.getBySlug(forum.props.slug);

        if (dbForum) {
            return res.code(409).send(ModelForum.serialize(dbForum));
        }

        const data = await ForumRepository.createForum(forum, user);
        return res.code(data.props.status).send(data.props.body);

    }

    async getForumDetails(req, res) {
        const slug = req.params.slug;

        const forum = await ForumRepository.getBySlug(slug);

        if (!forum) {
            return res.code(404).send({ message: `Can't find forum with slug ${slug}` })
        } else {
            return res.code(200).send(ModelForum.serialize(forum));
        }
    }

    async createThread(req, res) {
        const thread = new ModelThread(req.body);
        const slug = req.params.slug;
        const author = thread.props.author;

        if (thread.props.created) {
            if ((typeof thread.props.created === "object"))  {
                thread.props.created = new Date();
            }
        }

        if (isId(slug)) {
            return res.code(400).send({ message: "Slug can not contain only digits " });
        }

        const userData = await UserRepository.getByNickname(author);

        if (!userData) {
            return res.code(404).send({ message: `Can't find user with nickname ${author}` });
        }

        const user = new ModelUser(userData);
        let dbThread = ThreadRepository.getThread('slug', thread.props.slug);
        let forum = ForumRepository.getBySlug(slug);

        Promise.all([dbThread, forum]).then( async (result) => {
           dbThread = result[0];
           forum = result[1];

            if (dbThread) {
                return res.code(409).send(ModelThread.serialize(dbThread));
            }

            if (!forum) {
                return res.code(404).send({ message: `Can't find forum with slug ${slug}` });
            }

            forum = new ModelForum(forum);
            const data = await ThreadRepository.createThread(thread, forum, user);

            if (data.props.status === 201) {
                if (!thread.props.slug) {
                    delete data.props.body.slug;
                }

                return res.code(201).send(ModelThread.serialize(data.props.body));
            } else {
                return res.code(500).send(data.props.body);
            }
        });
    }

    async getForumThreads(req, res) {
        const slug = req.params.slug;
        const params = {
            desc : req.query.desc === 'true',
            limit : req.query.limit ? Number(req.query.limit) : 100,
            since : req.query.since,
        };

        const forum = await ForumRepository.getBySlug(slug);

        if (!forum) {
            return res.code(404).send({ message: `Can't find forum with slug ${slug}` })
        }

        const threads = await ThreadRepository.getForumThread(params, forum.slug);
        return res.code(200).send(threads.map((item) => ModelThread.serialize(item)));
    }

    async getForumUsers(req, res) {
        const slug = req.params.slug;
        const params = {
            desc : req.query.desc === 'true',
            limit : req.query.limit ? Number(req.query.limit) : 100,
            since : req.query.since,
        };

        const forum = await ForumRepository.getBySlug(slug);

        if (!forum) {
            return res.code(404).send({ message: `Can't find forum with slug ${slug}` })
        }

        const users = await UserRepository.getUsersFromForum(forum.slug, params);
        return res
            .code(200)
            .header('Content-Type', 'application/json; charset=utf-8')
            .send(users);
    }

}
