-- +goose Up
CREATE TABLE student (
    identifier TEXT PRIMARY KEY NOT NULL,
    first_name TEXT,
    last_name TEXT,

    UNIQUE(identifier)
);

CREATE TABLE question (
    type TEXT,
    number INTEGER,
    prompt TEXT,

    PRIMARY KEY (type, number)
);

CREATE TABLE presentation (
    presentation_id INT PRIMARY KEY,
    title TEXT,
    date TEXT,
    time TEXT,
    identifier TEXT NOT NULL REFERENCES student(identifier) ON DELETE CASCADE,

    UNIQUE(presentation_id, title, identifier)
);

CREATE TABLE response (
    responder_id TEXT NOT NULL REFERENCES student(identifier) ON DELETE CASCADE,
    presentation_id INT NOT NULL REFERENCES presentation(presentation_id) ON DELETE CASCADE,
    type TEXT,
    number INTEGER,
    answer TEXT,

    PRIMARY KEY (responder_id, presentation_id, type, number)
);

-- +goose Down
DROP TABLE question;
DROP TABLE response;
DROP TABLE presentation;
DROP TABLE student;


