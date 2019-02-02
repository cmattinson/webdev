package database

import (
	"database/sql"
	"fmt"

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
	PresenterID string `db:"presenster_id"`
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

	fmt.Println("Connected successfully")
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

	return true, nil
}

// GetStudents obtains a slice of students from the database
func (db *Database) GetStudents() ([]Student, error) {
	q := `SELECT *
			FROM student`

	students := []Student{}

	if err := db.Select(&students, q); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return students, nil
}

/* PostResponse adds a new record in the Response table for the currently authenticated responder
func (db *Database) PostResponse(responderID string, presenterID string, qType string, qNumber int) (int, error) {

}
*/
