import UserRepository from '../user/repositoryUser.js';
import ThreadRepository from '../thread/repositoryThread.js';
import ForumRepository from '../forum/repositoryForum.js';
import PostRepository from '../post/repositoryPost.js';

export default new class HandlerService {
    async status(req, res) {
        const forum = await ForumRepository.getCount();
        const user = await UserRepository.getCount();
        const thread = await ThreadRepository.getCount();
        const post = await PostRepository.getCount();

        return res.code(200).send({ forum, user, thread, post });
    }

    async delete(req, res) {
        await ForumRepository.clearAll();
        await UserRepository.clearAll();
        await ThreadRepository.clearAll();
        await PostRepository.clearAll();

        return res.code(200).send(null);
    }
}
