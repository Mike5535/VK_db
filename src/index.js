import fastify from 'fastify';

import { Api } from './config/config.js';
import HandlerUser from './user/handlerUser.js';
// import { pgp } from './driverDb/database.cjs';

const server = fastify({
    logger: true,
});

server.addContentTypeParser('serverlication/json', { parseAs: 'string' }, function (req, body, done) {
    try {
        let json = {};
        if (body){
            json = JSON.parse(body)
        }
        done(null, json)
    } catch (err) {
        err.statusCode = 400;
        done(err, undefined)
    }
});

server.post(Api.post.user.create, HandlerUser.createUser);
server.post(Api.get.user.profile, HandlerUser.updateUser);
server.get(Api.get.user.profile, HandlerUser.getUser);

// server.post(Api.post.forum.create, HandlerForum.createForum);
// server.post(Api.post.forum.createThread, HandlerForum.createThread);
// server.get(Api.get.forum.details, HandlerForum.getForumDetails);
// server.get(Api.get.forum.users, HandlerForum.getForumUsers);
// server.get(Api.get.forum.threads, HandlerForum.getForumThreads);

// server.post(Api.post.thread.create, HandlerThread.createPost);
// server.post(Api.post.thread.update, HandlerThread.updateThread);
// server.post(Api.post.thread.vote, HandlerThread.voteToThread);
// server.get(Api.get.thread.details, HandlerThread.getDetails);
// server.get(Api.get.thread.posts, HandlerThread.getThreadsPost);

// server.post(Api.post.post.update, HandlerPost.updatePost);
// server.get(Api.get.post.threads, HandlerPost.getDetails);

// server.post(Api.post.service, HandlerService.delete);
// server.get(Api.get.service, HandlerService.status);

server.get('/api', (req, res) => {
    return res.code(404).send(null);
});

server.listen({ port: 5000, host: '0.0.0.0' }, (err) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
})
