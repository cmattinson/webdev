package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	_ "github.com/lib/pq"
)

// Student struct
type Student struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

// Book struct
type Book struct {
	Title string
	Isbn  string
}

// Database struct
type Database struct {
	*sql.DB
}

// Handler struct
type Handler struct {
	*Database
}

func init() {
	db, err := OpenDatabase()

	if err != nil {
		fmt.Println("Database not open")
		fmt.Printf("%v", err)
	}

	handlers := Handler{
		db,
	}

	http.HandleFunc("/api/users", handlers.handleUsers)
	http.HandleFunc("/api/books", handlers.handleBooks)
}

// OpenDatabase opens database
func OpenDatabase() (*Database, error) {
	connectionString := "dbname=midterm user=postgres host=localhost port=5432 sslmode=disable"
	db := Database{}

	var err error

	db.DB, err = sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("Open: %v", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Ping: %v", err)
	}

	log.Println("Database opened successfully")

	return &db, nil
}

// GetStudents gets slice of students
func (db *Database) GetStudents() ([]Student, error) {
	q := `SELECT * FROM student`

	students := []Student{}

	rows, err := db.Query(q)

	if err != nil {
		return nil, fmt.Errorf("Get students: %v", err)
	}

	for rows.Next() {
		s := Student{}

		if err := rows.Scan(&s.ID, &s.Name); err != nil {
			return nil, fmt.Errorf("Scan: %v", err)
		}

		students = append(students, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Next: %v", err)
	}

	return students, nil

}

// InsertStudent does something
func (db *Database) InsertStudent(id int, name string) (int64, error) {
	q := `INSERT INTO student (id, name)
			VALUES ($1, "$2")`

	res, err := db.Exec(q, id, name)

	if err != nil {
		return 0, fmt.Errorf("%v", err)
	}

	rowsAffected, err := res.RowsAffected()

	if rowsAffected == 0 {
		log.Println("Insert failed")
		return 0, err
	}

	return rowsAffected, nil
}

func (h *Handler) handleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		students, err := h.GetStudents()

		if err != nil {
			panic(err)
		}

		studentJSON, err := json.MarshalIndent(students, "", "    ")

		fmt.Fprintf(w, "%s\n", studentJSON)
	} else if r.Method == "POST" {
		student := Student{}

		err := json.NewDecoder(r.Body).Decode(&student)

		if err != nil {
			fmt.Fprintf(w, "Error decoding JSON")
			fmt.Println(err)
		}

		id, err := strconv.Atoi(student.ID)

		if err != nil {
			http.Error(w, http.StatusText(400), 400)
		}

		rows, err := h.InsertStudent(id, student.Name)

		if err != nil {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		}

		if rows == 0 {
			log.Println("error inserting student")
		}

		log.Println("Student inserted successfully")
	}

}

func (h *Handler) handleBooks(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Database handler")
}
