export const Api = {
    post: {
        forum: {
            create: '/api/forum/create',
            createThread: '/api/forum/:slug/create'
        },
        post: {
            update: '/api/post/:id/details'
        },
        thread: {
            create: '/api/thread/:slug/create',
            update: '/api/thread/:slug/details',
            vote: '/api/thread/:slug/vote'
        },
        user: {
            create: '/api/user/:nickname/create',
            profile: '/api/user/:nickname/profile',
        },
        service: '/api/service/clear'
    },
    get: {
        forum: {
            details: '/api/forum/:slug/details',
            users: '/api/forum/:slug/users',
            threads: '/api/forum/:slug/threads'
        },
        post: {
            threads: '/api/post/:id/details'
        },
        thread: {
            details: '/api/thread/:slug/details',
            posts: '/api/thread/:slug/posts',
        },
        user: {
            profile: '/api/user/:nickname/profile',
        },
        service: '/api/service/status'
    }
};
