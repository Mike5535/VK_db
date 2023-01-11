import { ModelPost } from '../models/modelPost.js';
import UserRepository from '../user/repositoryUser.js';
import ForumRepository from '../forum/repositoryForum.js';
import ThreadRepository from '../thread/repositoryThread.js';
import PostRepository from './repositoryPost.js';
import { ModelThread } from "../models/modelThread.js";
import { ModelForum } from "../models/modelForum.js";

export default new class HandlerPost {

    async getDetails(req, res) {
        const post = await PostRepository.getPostById(req.params.id);

        if (!post) {
            return res.code(404).send({ message: `Can't find post with id ${req.params.id}` });
        }

        let result = {};

        result.post = ModelPost.serialize(post);

        if (req.query.related) {
            const relatedArray = req.query.related.split(',');

            if (relatedArray.includes('user')) {
                result.author = await UserRepository.getByNickname(post.author);
            }

            if (relatedArray.includes('thread')) {
                result.thread = ModelThread.serialize(await ThreadRepository.getThread('id', post.thread_id));
            }

            if (relatedArray.includes('forum')) {
                result.forum = ModelForum.serialize(await ForumRepository.getBySlug(post.forum_slug));
            }
        }

        return res.code(200).send(result);
    }

    async updatePost(req, res) {
        const id = Number(req.params.id);
        const post = await PostRepository.getPostById(id);
        const message = req.body.message;

        if (!post) {
            return res.code(404).send({ message: `Can't find post with id ${id}` });
        }

        if (!message || message === post.message) {
            return res.code(200).send(ModelPost.serialize(post));
        }

        const updatePost = await PostRepository.updatePost(new ModelPost({ id, ...req.body }));

        return res.code(updatePost.props.status).send(updatePost.props.body);
    }
}
