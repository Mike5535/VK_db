CREATE EXTENSION IF NOT EXISTS CITEXT;

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS forums CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS forum_users CASCADE;

CREATE UNLOGGED TABLE IF NOT EXISTS users (
    id       SERIAL         UNIQUE NOT NULL,
    nickname CITEXT  NOT NULL PRIMARY KEY,
    email    CITEXT         NOT NULL UNIQUE,
    fullname CITEXT         NOT NULL,
    about    TEXT           NOT NULL
);

CREATE UNLOGGED TABLE IF NOT EXISTS forums (
    id      SERIAL,
    slug    CITEXT PRIMARY KEY,
    posts   INT    NOT NULL DEFAULT 0,
    threads INT       NOT NULL DEFAULT 0,
    title   TEXT      NOT NULL,
    nickname CITEXT REFERENCES users (nickname)
);

CREATE UNLOGGED TABLE IF NOT EXISTS threads (
    id         SERIAL PRIMARY KEY ,
    author    CITEXT        NOT NULL REFERENCES users(nickname),
    author_id INT NOT NULL references users(id),
    created   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    forum     CITEXT        NOT NULL REFERENCES forums(slug),
    message   TEXT        NOT NULL,
    slug      CITEXT      UNIQUE,
    title     TEXT        NOT NULL,
    votes     INT         NOT NULL DEFAULT 0
);

CREATE UNLOGGED TABLE posts (
    id SERIAL PRIMARY KEY ,
    path INTEGER ARRAY,
    author CITEXT NOT NULL REFERENCES users(nickname),
    author_id INT NOT NULL REFERENCES  users(id),
    created TIMESTAMP WITH TIME ZONE DEFAULT now(),
    edited BOOLEAN DEFAULT FALSE,
    message TEXT  NOT NULL,
    parent_id INTEGER,
    forum_slug CITEXT NOT NULL,
    thread_id INTEGER NOT NULL
);

CREATE UNLOGGED TABLE forum_users (
    user_id INT REFERENCES users(id),
    forum_slug CITEXT REFERENCES forums(slug)
);

CREATE UNLOGGED TABLE IF NOT EXISTS votes (
    nickname        CITEXT      NOT NULL REFERENCES users(nickname),
    thread          BIGINT      NOT NULL REFERENCES threads(id),
    voice           INTEGER     DEFAULT 0,
    CONSTRAINT votes_user_thread_unique UNIQUE(nickname, thread)
);

CREATE INDEX ON forums USING hash(slug);
CREATE INDEX ON users(id);
CREATE INDEX ON users(email);
CREATE INDEX ON users(nickname, email);
CREATE INDEX ON users(email, nickname);
CREATE INDEX ON users USING hash(nickname);
CREATE INDEX ON threads USING hash(slug);
CREATE INDEX ON threads(created);
CREATE INDEX ON threads(id);
CREATE INDEX ON threads(slug, id);
CREATE INDEX ON threads(id, slug);
CREATE INDEX ON threads(forum, created);
CREATE INDEX ON posts (thread_id);
CREATE INDEX ON posts (path, created, id);
CREATE INDEX ON posts (path);
CREATE INDEX ON posts (id);
CREATE INDEX ON posts (thread_id, path);
CREATE INDEX ON posts (created, id);
CREATE INDEX ON posts (thread_id, id);
CREATE INDEX ON posts (id, thread_id);
CREATE INDEX ON votes (voice);
CREATE INDEX ON votes (nickname, thread);
CREATE INDEX ON votes (thread, nickname);
CREATE INDEX ON forum_users (forum_slug, user_id);
CREATE INDEX ON posts (thread_id, array_length(path, 1))
    WHERE array_length(path, 1) = 1;
CREATE INDEX ON posts ((path[1]));
CREATE INDEX ON posts ((path[1]), (path[2:]), created, id);
CREATE INDEX ON posts (thread_id, array_length(path, 1), (path[1]))
    WHERE array_length(path, 1) = 1;
CREATE UNIQUE INDEX idx_forums_id ON forums(id);
CREATE UNIQUE INDEX idx_forums_slug_id ON forums(slug, id);
CREATE UNIQUE INDEX idx_forums_id_slug ON forums(id, slug);
CREATE UNIQUE INDEX idx_forum_users_slug ON forum_users(forum_slug, user_id);

CREATE OR REPLACE FUNCTION path_update() RETURNS TRIGGER AS $path$
DECLARE
    parent_path INT[];
    parent_thread_id INT;
BEGIN
    IF (NEW.parent_id is null ) THEN
        NEW.path := NEW.path || NEW.id;
    ELSE
        SELECT path, thread_id FROM posts
        WHERE id = NEW.parent_id  INTO parent_path, parent_thread_id;
        NEW.path := NEW.path || parent_path || NEW.id;
    END IF;
    RETURN NEW;
END;
$path$ LANGUAGE  plpgsql;

CREATE TRIGGER path_trigger BEFORE INSERT ON posts FOR EACH ROW EXECUTE PROCEDURE path_update();
