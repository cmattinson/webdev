-- +goose Up
CREATE TABLE student (
    identifier TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE question (
    responder_id TEXT NOT NULL REFERENCES student(identifier),
    presenter_id TEXT NOT NULL REFERENCES student(identifier),
    type TEXT,
    number INTEGER,
    prompt TEXT,
    answer TEXT,

    PRIMARY KEY (responder_id, presenter_id, type, number)
);

CREATE TABLE presentation (
    title TEXT PRIMARY KEY,
    name TEXT,
    date DATE,
    time TIME,
    identifier TEXT NOT NULL REFERENCES student(identifier),

    UNIQUE(title, identifier)
);

-- +goose Down
DROP TABLE question;
DROP TABLE presentation;
DROP TABLE student;

