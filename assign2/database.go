/*
	CMPT 315 - Assignment 1
	Author: Chris Mattinson

	This program handles database operations and accessess
*/

package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
)

// Student represents data stored for a single student
type Student struct {
	Identifier string `db:"identifier"`
	FirstName  string `db:"first_name"`
	LastName   string `db:"last_name"`
}

// StudentInfo will be used for displaying info for each presenter
type StudentInfo struct {
	FirstName      string `db:"first_name" json:"firstName" xml:"firstName"`
	LastName       string `db:"last_name" json:"lastName" xml:"lastName"`
	PresentationID int    `db:"presentation_id" json:"presentationID" xml:"presentationID"`
}

// Question represents all data for the questions for each presenter
type Question struct {
	Type   string `db:"type" json:"type" xml:"type"`
	Number int    `db:"number" json:"number" xml:"number"`
	Prompt string `db:"prompt" json:"prompt" xml:"prompt"`
}

// Response represents a response to a question by a certain student
type Response struct {
	ResponderID    string `db:"responder_id"`
	PresentationID int    `db:"presentation_id"`
	Type           string `db:"type"`
	Number         int    `db:"number"`
	Answer         string `db:"answer"`
}

// Presentation represents the data for each presentation
type Presentation struct {
	PresentationID int    `db:"presentation_id"`
	Title          string `db:"title"`
	Date           string `db:"date"`
	Time           string `db:"time"`
	Identifier     string `db:"identifier"`
}

// PresentationInfo will serve as a representation to the user
type PresentationInfo struct {
	Title     string `db:"title" json:"title" xml:"title"`
	FirstName string `db:"first_name" json:"firstName" xml:"firstName"`
	LastName  string `db:"last_name" json:"lastName" xml:"lastName"`
	Date      string `db:"date" json:"date" xml:"date"`
	Time      string `db:"time" json:"time" xml:"time"`
}

// ResponseDisplay used for displaying a response to a question
type ResponseDisplay struct {
	Type   string `json:"type" xml:"type"`
	Number int    `json:"number" xml:"number"`
	Prompt string `json:"prompt" xml:"prompt"`
	Answer string `json:"answer" xml:"answer"`
}

// Database defines own type for the sqlx DB
type Database struct {
	*sqlx.DB
}

var connectionString = "dbname=assign user=postgres port=5432 sslmode=disable"

// OpenDatabase opens the database specified by connectionString and returns a handle to it
func OpenDatabase() (*Database, error) {
	db := Database{}
	var err error

	db.DB, err = sqlx.Connect("postgres", "user=postgres dbname=assign sslmode=disable")

	if err != nil {
		return nil, fmt.Errorf("Open (%v): %v", connectionString, err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Ping: %v", err)
	}

	log.Println("Connected to database successfully")
	return &db, nil
}

// Authenticate queries the database for the student with the passed identifier
func (db *Database) Authenticate(identifier string) (bool, error) {
	q := `SELECT COUNT(*)
			FROM student
			WHERE student.identifier = $1`

	var count int
	if err := db.Get(&count, q, identifier); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}

		return false, fmt.Errorf("Get: %v", err)
	}

	// Return false if user doesn't exist, true otherwise
	if count == 0 {
		return false, nil
	}

	return true, nil
}

// GetPresenters obtains a slice of students from the database
func (db *Database) GetPresenters() ([]StudentInfo, error) {
	q := `SELECT first_name, last_name, presentation_id
			FROM student, presentation
			WHERE student.identifier = presentation.identifier
			ORDER BY last_name, first_name`

	students := []StudentInfo{}

	if err := db.Select(&students, q); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return students, nil
}

// GetPresentation obtains all of the information about the selected presenter and their presentation
func (db *Database) GetPresentation(id int) (PresentationInfo, error) {
	q := `SELECT presentation.title, student.first_name, student.last_name, presentation.date, presentation.time
			FROM presentation, student
			WHERE presentation_id = $1
			AND student.identifier = presentation.identifier`

	presentation := PresentationInfo{}

	if err := db.Get(&presentation, q, id); err != nil {
		return PresentationInfo{}, err
	}

	return presentation, nil
}

// GetQuestions gets a slice of all questions in the database
func (db *Database) GetQuestions() ([]Question, error) {
	q := `SELECT * FROM question`

	questions := []Question{}

	if err := db.Select(&questions, q); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return questions, nil
}

// QuestionExists checks if the desired question exists in the database
func (db *Database) QuestionExists(questionType string, number int) (bool, error) {
	q := `SELECT COUNT(*)
	FROM question
	WHERE type = $1
	AND number = $2`

	var count int
	if err := db.Get(&count, q, questionType, number); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}

		return false, fmt.Errorf("Get: %v", err)
	}

	// Return false if question doesn't exist
	if count == 0 {
		return false, nil
	}

	return true, nil
}

// ResponseExists will check if the response being POSTed already exists
func (db *Database) ResponseExists(responderID string, presentationID int, questionType string, number int) (bool, error) {
	q := `SELECT COUNT(*)
			FROM response
			WHERE responder_id = $1
			AND presentation_id = $2
			AND type = $3
			AND number = $4`

	var count int
	if err := db.Get(&count, q, responderID, presentationID, questionType, number); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}

		return false, fmt.Errorf("Get: %v", err)
	}

	// Return false if response doesn't exist
	if count == 0 {
		return false, nil
	}

	return true, nil

}

// UpdateResponse will update a response from a PUT request
func (db *Database) UpdateResponse(responderID string, presentationID int, questionType string, number int, answer string) (bool, error) {
	questionExists, err := db.QuestionExists(questionType, number)

	if err != nil {
		return false, fmt.Errorf("QuestionExists: %v", err)
	}

	if !questionExists {
		return false, fmt.Errorf("Question does not exist in the database")
	}

	// Check if response already exists
	respExists, err := db.ResponseExists(responderID, presentationID, questionType, number)

	if err != nil {
		return false, fmt.Errorf("ResponseExists: %v", err)
	}

	if respExists {
		q := `UPDATE response SET
		answer = $1
		WHERE
		responder_id = $2
		AND
		presentation_id = $3
		AND
		type = $4
		AND
		number = $5`

		_, err := db.Exec(q, answer, responderID, presentationID, questionType, number)

		if err != nil {
			return false, err
		}
		return true, nil
	}

	return false, nil
}

// RespondToQuestion sends an insert or update query to the database
func (db *Database) RespondToQuestion(responderID string, presentationID int, questionType string, number int, answer string) (bool, error) {
	questionExists, err := db.QuestionExists(questionType, number)

	if err != nil {
		return false, fmt.Errorf("QuestionExists: %v", err)
	}

	if !questionExists {
		return false, fmt.Errorf("Question does not exist in the database")
	}

	q := `INSERT INTO response (responder_id, presentation_id, type, number, answer)
				VALUES ($1, $2, $3, $4, $5)`

	_, err = db.Exec(q, responderID, presentationID, questionType, number, answer)

	if err != nil {
		return false, err
	}
	return true, nil
}

// GetResponses gets a slice of responses from the current responder to the desired presenter
func (db *Database) GetResponses(responderID string, presentationID int) ([]ResponseDisplay, error) {
	q := `SELECT response.type, response.number, question.prompt, response.answer
			FROM response, question
			WHERE response.type = question.type
			AND response.number = question.number
			AND responder_id = $1
			AND presentation_id = $2`

	responses := []ResponseDisplay{}

	if err := db.Select(&responses, q, responderID, presentationID); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return responses, nil
}

// DeleteResponse will delete the requested response from the database
func (db *Database) DeleteResponse(responderID string, presentationID int, questionType string, number int) (bool, error) {
	q := `DELETE FROM response
			WHERE responder_id = $1
			AND presentation_id = $2
			AND type = $3
			AND number = $4`

	exists, err := db.ResponseExists(responderID, presentationID, questionType, number)

	if err != nil {
		return false, err
	}

	if !exists {
		return false, nil
	}

	_, err = db.Exec(q, responderID, presentationID, questionType, number)

	if err != nil {
		return false, err
	}

	return true, nil
}
