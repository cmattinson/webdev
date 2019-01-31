-- +goose Up
CREATE TABLE student (
	student_id SERIAL PRIMARY KEY,
	first_name TEXT,
	last_name TEXT
);

CREATE TABLE course (
	course_id SERIAL PRIMARY KEY,
	department TEXT,
	course_number NUMERIC,
	section TEXT,

	UNIQUE(department, course_number, section)
);

CREATE TABLE enrollment (
	enrollment_id SERIAL PRIMARY KEY,
	student_id SERIAL NOT NULL REFERENCES student(student_id),
	course_id SERIAL NOT NULL REFERENCES course(course_id),

	UNIQUE(student_id, course_id)
);

-- +goose Down
DROP TABLE enrollment;
DROP TABLE course;
DROP TABLE student;
