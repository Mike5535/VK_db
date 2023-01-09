const fastify = require('fastify');

const server = fastify({
    logger: true,
});

server.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
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

server.listen({ port: 5000, host: '0.0.0.0' }, (err) => {
    if (err) {
      server.log.error(err)
      process.exit(1)
    }
})
