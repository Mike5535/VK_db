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
    CONSTRAINT unique_vote UNIQUE(nickname, thread)
);
