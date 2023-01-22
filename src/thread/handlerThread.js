import ThreadRepository from './repositoryThread.js';
import PostRepository from '../post/repositoryPost.js';
import { ModelPost } from "../models/modelPost.js";
import { isId } from "../utils/utils.js";
import { ModelThread } from "../models/modelThread.js";

export default new class HandlerThread {
    async createPost(req, res) {
        const posts  = req.body;

        const type = isId(req.params.slug) ? 'id' : 'slug';
        const value = isId(req.params.slug) ? Number(req.params.slug) : req.params.slug;

        let thread = await ThreadRepository.getThread(type, value);

        if (!thread) {
            return res.code(404).send({ message: `Can't find forum with slug or id ${req.params.slug}`});
        }

        thread = new ModelThread(thread);

        if (Array.isArray(posts) && !posts.length) {
            return res.code(201).send(posts);
        }

        const resultPost = await PostRepository.createPost(posts, thread);

        if (resultPost.props.status === 409) {
            return res.code(409).send({ message: resultPost.props.body  });
        } else if (resultPost.props.status === 404) {
            return res.code(404).send({ message: "Can't find post author by nickname" })
        }

        return res.code(201).send(resultPost.props.body.map((item) => ModelPost.serialize(item)))
    }

    async voteToThread(req, res) {
        const vote = req.body;

        const type = isId(req.params.slug) ? 'id' : 'LOWER(slug)';
        const value = isId(req.params.slug) ? Number(req.params.slug) :req.params.slug.toLowerCase();


        const voteResult = await ThreadRepository.createVote(vote.voice, vote.nickname, type, value);

        if (voteResult.props.status !== 200) {
            return res.code(404).send({ message: voteResult.props.body })
        }

        return res.code(200).send(voteResult.props.body);
    }

    async getDetails(req, res) {
        const type = isId(req.params.slug) ? 'id' : 'slug';
        const value = isId(req.params.slug) ? Number(req.params.slug) : req.params.slug;

        let thread = await ThreadRepository.getThread(type, value);

        if (!thread) {
            return res.code(404).send({ message: `Can't find forum with slug or id ${req.params.slug}`});
        } else {
            return res.code(200).send(ModelThread.serialize(thread));
        }
    }

    async updateThread(req, res) {
        const type = isId(req.params.slug) ? 'id' : 'slug';
        const value = isId(req.params.slug) ? Number(req.params.slug) : req.params.slug;

        let thread = await ThreadRepository.getThread(type, value);

        if (!thread) {
            return res.code(404).send({ message: `Can't find forum with slug or id ${req.params.slug}`});
        }

        const updateThread = await ThreadRepository.updateThread(thread.id, new ModelThread(req.body));

        const result = updateThread === true ? thread : updateThread;

        return res.code(200).send(ModelThread.serialize(result));
    }

    async getThreadsPost(req, res) {
        const type = isId(req.params.slug) ? 'id' : 'slug';
        const value = isId(req.params.slug) ? Number(req.params.slug) : req.params.slug;

        let thread = await ThreadRepository.getThread(type, value);

        if (!thread) {
            return res.code(404).send({ message: `Can't find forum with slug or id ${req.params.slug}`});
        }

        const posts = await PostRepository.getPostByThreadId(req.query.sort, thread.id, {
            desc : req.query.desc === 'true',
            limit : req.query.limit ? parseInt(req.query.limit) : 100,
            since : req.query.since,
        });

        return res.code(200).send(posts.map((item) => ModelPost.serialize(item)));
    }

}
