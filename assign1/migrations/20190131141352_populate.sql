-- +goose Up
insert into student (identifier, name) values ('jqYPeRSj', 'Chris');
insert into student (identifier, name) values ('cmTYdFRm', 'Nick');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 1, 'Preparedness: the presenter was adequately prepared.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 2, 'Organization: the presentation material was arranged logically.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 3, 'Correctness: the presented facts were correct (to the best of your knowledge).', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 4, 'Visualization: the visual material included appropriate content/fonts/graphics.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 5, 'General introduction: the presentation clearly introduced the broad area containing the topic.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 6, 'Motivation: the presentation clearly motivated the specific topic in the context of the broad area.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 7, 'Introduction: the presentation clearly introduced the specific topic.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 8, 'Tutorial/demonstration: the tutorial/demonstration improved your understanding of the specific topic.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 9, 'Multiple-choice questions: at least three multiple-choice questions assessed your understanding of the presented content.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'M/C', 10, 'Answers: the presenter''s answers to questions were satisfying.', 'True');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'Open', 1, 'Provide any comments for the presenter.', 'Your presentation was well paced and interesting');

insert into question (responder_id, presenter_id, type, number, prompt, answer) 
values ('jqYPeRSj', 'cmTYdFRm', 'Open', 2, 'Provide any comments for your instructor.', 'This presentation was the best');

insert into presentation (title, name, date, time, identifier) 
values ('An Introduction to Go Programming', 'Nick', '2019-01-31', '09:30', 'cmTYdFRm');

-- +goose Down
DELETE FROM student;
DELETE FROM question;
DELETE FROM presentation;