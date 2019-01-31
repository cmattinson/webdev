-- +goose Up
CREATE TABLE student (
    identifier TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE question (
    identifier TEXT NOT NULL REFERENCES student(identifier),
    type TEXT,
    number INTEGER,
    prompt TEXT,
    answer TEXT,

    PRIMARY KEY (identifier, type, number)
);

CREATE TABLE presentation (
    title TEXT PRIMARY KEY,
    name TEXT,
    identifier TEXT NOT NULL REFERENCES student(identifier),

    UNIQUE(title, identifier)
);

-- +goose Down
DROP TABLE student;
DROP TABLE question;
DROP TABLE presentation;

