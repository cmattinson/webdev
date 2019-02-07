-- +goose Up
CREATE TABLE student (
    identifier TEXT PRIMARY KEY,
    name TEXT,

    UNIQUE(identifier)
);

CREATE TABLE question (
    type TEXT,
    number INTEGER,
    prompt TEXT,

    PRIMARY KEY (type, number)
);

CREATE TABLE response (
    responder_id TEXT NOT NULL REFERENCES student(identifier) ON DELETE CASCADE,
    presenter_id TEXT NOT NULL REFERENCES student(identifier) ON DELETE CASCADE,
    type TEXT,
    number INTEGER,
    answer TEXT,

    PRIMARY KEY (responder_id, presenter_id, type, number)
);

CREATE TABLE presentation (
    title TEXT PRIMARY KEY,
    name TEXT,
    date TEXT,
    time TEXT,
    identifier TEXT NOT NULL REFERENCES student(identifier) ON DELETE CASCADE,

    UNIQUE(title, identifier)
);

-- +goose Down
DROP TABLE question;
DROP TABLE response;
DROP TABLE presentation;
DROP TABLE student;


