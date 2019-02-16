-- +goose Up
insert into student (identifier, first_name, last_name) values ('jqYPeRSj', 'Chris', 'Mattinson');
insert into student (identifier, first_name, last_name) values ('cmTYdFRm', 'Nick', 'Boers');
insert into student (identifier, first_name, last_name) values ('oyLCuRPs', 'Lottie', 'Krale');
insert into student (identifier, first_name, last_name) values ('pvDVrBSe', 'Hannie', 'Hurran');
insert into student (identifier, first_name, last_name) values ('dlZSdKVu', 'Helenka', 'Lacase');
insert into student (identifier, first_name, last_name) values ('wqHXyZLe', 'Rosalynd', 'Nattriss');
insert into student (identifier, first_name, last_name) values ('fqAGgODz', 'Heloise', 'McNysche');
insert into student (identifier, first_name, last_name) values ('duCKrFLq', 'Orbadiah', 'Jecock');
insert into student (identifier, first_name, last_name) values ('aeMEeTSq', 'Joan', 'Robers');
insert into student (identifier, first_name, last_name) values ('orFQnNIe', 'Dreddy', 'Noel');


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
values (1, 'An Introduction to Go Programming', '2019-01-31', '09:30', 'cmTYdFRm');

insert into presentation (presentation_id, title, date, time, identifier)
values (2, 'Restful API Design', '2019-02-08', '11:30', 'jqYPeRSj');

insert into presentation (presentation_id, title, date, time, identifier)
values (3, 'Back End Development', '2019-02-09', '09:30', 'oyLCuRPs');

insert into presentation (presentation_id, title, date, time, identifier)
values (4, 'Front End Development', '2019-02-15', '10:30', 'pvDVrBSe');

-- +goose Down
DELETE FROM student;
DELETE FROM question;
DELETE FROM presentation;