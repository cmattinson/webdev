package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// Handler wraps the Database struct
type Handler struct {
	*Database
}

// Responder stores the currently logged in to the API
type Responder struct {
	identifier string
}

func main() {
	db, err := OpenDatabase()
	if err != nil {
		log.Fatalf("OpenDatabase: %v", err)
	}
	defer db.Close()

	handlers := Handler{
		db,
	}

	router := mux.NewRouter()
	// router.HandleFunc("/api/auth", handlers.authHandler)
	router.HandleFunc("/api/presenters", authHandler(handlers.presentersListHandler))
	router.HandleFunc("/api/presenters/{identifier}", handlers.presenterHandler)

	log.Fatal(http.ListenAndServe(":8080", router))
}

func authHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Before middleware")
		next.ServeHTTP(w, r)
		fmt.Println("After middleware")
	})
}

func (h *Handler) presentersListHandler(w http.ResponseWriter, r *http.Request) {
	students, err := h.GetStudents()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	for _, s := range students {
		fmt.Fprintf(w, "%s\n", s.Name)
	}
}

func (h *Handler) presenterHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	identifier := vars["identifier"]

	info, err := h.GetPresentation(identifier)

	if err != nil {
		panic(err)
	}

	// https://play.golang.org/p/6jHI-MRx0z
	json, err := json.MarshalIndent(info, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", json)

	questions, err := h.GetQuestions()

	if err != nil {
		panic(err)
	}

	json, err = json.MarshalIndent(questions, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", json)
}
