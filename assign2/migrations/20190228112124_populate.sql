-- +goose Up

-- Testing accounts
insert into student (identifier, first_name, last_name) values ('test', 'Chris', 'Mattinson');
insert into student (identifier, first_name, last_name) values ('nick', 'Nick', 'Boers');

insert into student (identifier, first_name, last_name) values ('oyLCuRPs', 'Linus', 'Torvalds');
insert into student (identifier, first_name, last_name) values ('pvDVrBSe', 'Ken', 'Thompson');
insert into student (identifier, first_name, last_name) values ('dlZSdKVu', 'Larry', 'Wall');
insert into student (identifier, first_name, last_name) values ('fqAGgODz', 'Yehuda', 'Katz');
insert into student (identifier, first_name, last_name) values ('duCKrFLq', 'Rob', 'Pike');

insert into question (type, number, prompt) 
values ('M/C', 1, 'Preparedness: the presenter was adequately prepared.');

insert into question (type, number, prompt) 
values ('M/C', 2, 'Organization: the presentation material was arranged logically.');

insert into question (type, number, prompt) 
values ('M/C', 3, 'Correctness: the presented facts were correct (to the best of your knowledge).');

insert into question (type, number, prompt) 
values ('M/C', 4, 'Visualization: the visual material included appropriate content/fonts/graphics.');

insert into question (type, number, prompt) 
values ('M/C', 5, 'General introduction: the presentation clearly introduced the broad area containing the topic.');

insert into question (type, number, prompt) 
values ('M/C', 6, 'Motivation: the presentation clearly motivated the specific topic in the context of the broad area.');

insert into question (type, number, prompt) 
values ('M/C', 7, 'Introduction: the presentation clearly introduced the specific topic.');

insert into question (type, number, prompt)  
values ('M/C', 8, 'Tutorial/demonstration: the tutorial/demonstration improved your understanding of the specific topic.');

insert into question (type, number, prompt) 
values ('M/C', 9, 'Multiple-choice questions: at least three multiple-choice questions assessed your understanding of the presented content.');

insert into question (type, number, prompt) 
values ('M/C', 10, 'Answers: the presenter''s answers to questions were satisfying.');

insert into question (type, number, prompt) 
values ('Open', 1, 'Provide any comments for the presenter.');

insert into question (type, number, prompt) 
values ('Open', 2, 'Provide any comments for your instructor.');

insert into presentation (presentation_id, title, date, time, identifier) 
values (1, 'An Introduction to Go Programming', '2019-01-31', '09:30', 'nick');

insert into presentation (presentation_id, title, date, time, identifier)
values (2, 'Restful API Design', '2019-04-01', '11:30', 'test');

insert into presentation (presentation_id, title, date, time, identifier)
values (3, 'Version Control with Git', '2019-04-02', '09:30', 'oyLCuRPs');

insert into presentation (presentation_id, title, date, time, identifier)
values (4, 'The UNIX Environment', '2019-04-03', '10:30', 'pvDVrBSe');

insert into presentation (presentation_id, title, date, time, identifier)
values (5, 'Scripting with Perl', '2019-04-04', '02:30', 'dlZSdKVu');

insert into presentation (presentation_id, title, date, time, identifier)
values (6, 'Ember.js - A Front End Framework', '2019-04-05', '11:30', 'fqAGgODz');

insert into presentation (presentation_id, title, date, time, identifier)
values (7, 'The Success of Golang', '2019-04-06', '03:30', 'duCKrFLq');

-- +goose Down
DELETE FROM student;
DELETE FROM question;
DELETE FROM presentation;