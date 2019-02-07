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
	Identifier string `json:"id"`
}

var identifier string
var authorized bool

// Upon running the application, there is no responder
func init() {
	identifier = ""
	authorized = false
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
	router.HandleFunc("/api/v1", handlers.authHandler(handlers.authorize))
	router.HandleFunc("/api/v1/presenters", checkForAuthentication(handlers.presentersListHandler))
	router.HandleFunc("/api/v1/presenters/{identifier}", checkForAuthentication(handlers.presenterHandler))

	log.Fatal(http.ListenAndServe(":8080", router))
}

// authHandler is middleware to check that the responder is authorized to the API
func (h *Handler) authHandler(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responder := Responder{}
		err := json.NewDecoder(r.Body).Decode(&responder)

		if err != nil {
			panic(err)
		}

		isStudent, err := h.Authenticate(responder.Identifier)

		if !isStudent {
			fmt.Println(responder.Identifier + " is not a student")
			authorized = false
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		fmt.Println(responder.Identifier + " is a student")
		identifier = responder.Identifier
		authorized = true

		next.ServeHTTP(w, r)
	})
}

// Upon successful authentication, redirect the student to the presenters list
func (h *Handler) authorize(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/v1/presenters", http.StatusSeeOther)
}

// This function will check if there is a currently stored user that is authenticated
func checkForAuthentication(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if identifier == "" || !authorized {
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
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
}
