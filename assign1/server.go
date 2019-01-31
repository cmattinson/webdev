package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// student represents all of the data stored for a single student
type student struct {
	Identifier int    `db:"identifier"`
	Name       string `db:"name"`
}

// course represents all of the data stored for a single course
type question struct {
	Identifier string `db:"identifier"`
	Type       string `db:"type"`
	Number     int    `db:"number"`
	Prompt     string `db:"prompt"`
	Answer     string `db:"answer"`
}

// enrollment represents the relationship between students and courses;
// when a student is enrolled in a course, both the student ID and
// course ID appear in such a record
type presentation struct {
	Title      string `db:"title"`
	Name       string `db:"name"`
	Identifier string `db:"identifier"`
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", redirectHandler)
	router.HandleFunc("/api/auth", authHandler)
	router.HandleFunc("/api/presenters", presentersHandler)

	panic(http.ListenAndServe(":8080", router))
}

// Redirect base path to authentication path
func redirectHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/auth", http.StatusSeeOther)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Authentication page")
}

func presentersHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Presenters list")
}
