package main

import (
	"fmt"
	"log"
	"net/http"

	"../database"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", redirectHandler)
	router.HandleFunc("/api/auth", authHandler)
	router.HandleFunc("/api/presenters", presentersHandler)

	log.Fatal(http.ListenAndServe(":8080", router))
}

// Redirect base path to authentication path
func redirectHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/auth", http.StatusSeeOther)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Authentication page")
}

func presentersHandler(w http.ResponseWriter, r *http.Request) {
	db, err := database.OpenDatabase()

	if err != nil {
		log.Fatalf("OpenDatabase: %v", err)
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
