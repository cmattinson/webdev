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
	Name       string `db:"name"`
}

// Question represents all data for the questions for each presenter
type Question struct {
	Type   string `db:"type"`
	Number int    `db:"number"`
	Prompt string `db:"prompt"`
}

// Response represents a response to a question by a certain student
type Response struct {
	ResponderID string `db:"responder_id"`
	PresenterID string `db:"presenter_id"`
	Type        string `db:"type"`
	Number      int    `db:"number"`
	Answer      string `db:"answer"`
}

// Presentation represents the data for each presentation
type Presentation struct {
	Title      string `db:"title"`
	Name       string `db:"name"`
	Date       string `db:"date"`
	Time       string `db:"time"`
	Identifier string `db:"identifier"`
}

// Database defines own type for the sqlx DB
type Database struct {
	*sqlx.DB
}

// ResponseDisplay used for displaying a response to a question
type ResponseDisplay struct {
	Type   string
	Number int
	Prompt string
	Answer string
}

var connectionString = "dbname=assign1 user=postgres port=5432 sslmode=disable"

// OpenDatabase opens the database specified by connectionString and returns a handle to it
func OpenDatabase() (*Database, error) {
	db := Database{}
	var err error

	db.DB, err = sqlx.Connect("postgres", "user=postgres dbname=assign1 sslmode=disable")

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

// GetStudents obtains a slice of students from the database
func (db *Database) GetStudents() ([]Student, error) {
	q := `SELECT * FROM student`

	students := []Student{}

	if err := db.Select(&students, q); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return students, nil
}

// GetPresentation obtains all of the information about the selected presenter and their presentation
func (db *Database) GetPresentation(identifier string) (Presentation, error) {
	q := `SELECT title, name, date, time
			FROM presentation
			WHERE identifier = $1`

	presentation := Presentation{}

	if err := db.Get(&presentation, q, identifier); err != nil {
		return Presentation{}, err
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

// ResponseExists will check if the response being POSTed already exists
func (db *Database) ResponseExists(responderID string, presenterID, questionType string, number int) (bool, error) {
	q := `SELECT COUNT(*)
			FROM response
			WHERE response.responder_id = $1
			AND response.presenter_id = $2
			AND response.type = $3
			AND response.number = $4`

	var count int
	if err := db.Get(&count, q, responderID, presenterID, questionType, number); err != nil {
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

// RespondToQuestion sends an insert or update query to the database
func (db *Database) RespondToQuestion(responderID string, presenterID string, questionType string, number int, answer string) error {
	// Check if question response already exists
	exists, err := db.ResponseExists(responderID, presenterID, questionType, number)

	if err != nil {
		fmt.Errorf("ResponseExists: %v", err)
	}

	// Response exists, update instead of insert
	if exists == true {
		q := `UPDATE response 
			SET answer = $1
			WHERE responder_id = $2
			AND presenter_id = $3
			AND type = $4
			AND number = $5`

		if err := db.MustExec(q, answer, responderID, presenterID, questionType, number); err != nil {
			fmt.Errorf("Update: %v", err)
		}

		return nil
	} else if !exists {
		q := `INSERT INTO response (responder_id, presenter_id, type, number, answer)
		VALUES ($1, $2, $3, $4, $5)`

		if err := db.MustExec(q, responderID, presenterID, questionType, number, answer); err != nil {
			fmt.Errorf("Insert: %v", err)
		}

		return nil
	}

	return nil
}

// GetResponses gets a slice of responses from the current responder to the desired presenter
func (db *Database) GetResponses(responderID string, presenterID string) ([]ResponseDisplay, error) {
	q := `SELECT response.type, response.number, question.prompt, response.answer
			FROM response, question
			WHERE response.type = question.type
			AND response.number = question.number
			AND responder_id = $1
			AND presenter_id = $2`

	responses := []ResponseDisplay{}

	if err := db.Select(&responses, q, responderID, presenterID); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return responses, nil
}
