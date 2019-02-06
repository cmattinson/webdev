package main

import (
	"fmt"
	"log"
	"net/http"

	"./database"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/api/auth/{identifier}", authHandler)
	router.HandleFunc("/api/presenters", presentersListHandler)
	router.HandleFunc("/api/presenters/{identifier}", presenterHandler)

	log.Fatal(http.ListenAndServe(":8080", router))
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.OpenDatabase()

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
	defer db.Close()

	vars := mux.Vars(r)
	identifier := vars["identifier"]
	isStudent, err := db.Authenticate(identifier)

	// Redirect authorized student to presenters list
	if isStudent {
		http.Redirect(w, r, "/api/presenters", http.StatusFound)
	} else { // Student is not authorized to access API
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
	}
}

func presentersListHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.OpenDatabase()

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
	defer db.Close()

	students, err := db.GetStudents()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	for _, s := range students {
		fmt.Fprintf(w, "%s\n", s.Name)
	}
}

func presenterHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.OpenDatabase()

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
	defer db.Close()

	// vars := mux.Vars(r)
	// identifier := vars["identifier"]

	db.GetPresenterInfo("cmTYdFRm")
}
