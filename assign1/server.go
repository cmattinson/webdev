package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// Student represents data stored for a single student
type Student struct {
	Identifier string `db:"identifier"`
	Name       string `db:"name"`
}

// Question represents all data for the questions for each presenter
type Question struct {
	ResponderID string `db:"responder_id"`
	PresenterID string `db:"presenter_id"`
	Type        string `db:"type"`
	Number      int    `db:"number"`
	Prompt      string `db:"prompt"`
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

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", redirectHandler)
	router.HandleFunc("/api/auth", authHandler)
	router.HandleFunc("/api/presenters", presentersHandler)

	log.Fatal(http.ListenAndServe(":8080", router))
}

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

// Redirect base path to authentication path
func redirectHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/auth", http.StatusSeeOther)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Authentication page")
}

func presentersHandler(w http.ResponseWriter, r *http.Request) {
	db, err := OpenDatabase()

	if err != nil {
		log.Fatalf("OpenDatabase: %v", err)
	}
	defer db.Close()

	students, err := db.GetPresenters()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	for _, s := range students {
		fmt.Fprintf(w, "%s\n", s.Name)
	}
}

func (db *Database) GetPresenters() ([]Student, error) {
	q := `SELECT *
			FROM student`

	students := []Student{}

	if err := db.Select(&students, q); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return students, nil
}
