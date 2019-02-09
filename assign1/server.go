package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// Handler wraps the Database struct
type Handler struct {
	*Database
}

// Responder stores an authentication request
type Responder struct {
	Identifier string `json:"id"`
}

// ResponseRequest stores an incoming question response request
type ResponseRequest struct {
	Type   string `json:"type"`
	Number int    `json:"number"`
	Answer string `json:"answer"`
}

// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
type key string

const apiID key = ""

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
	router.HandleFunc("/api/v1", handlers.authentication(handlers.authorize)).
		Methods("POST")
	router.HandleFunc("/api/v1/presenters", handlers.authentication(handlers.presentersListHandler)).
		Methods("GET")
	router.HandleFunc("/api/v1/presenters/{identifier}", handlers.authentication(handlers.presenterHandler)).
		Methods("GET")
	router.HandleFunc("/api/v1/presenters/{identifier}", handlers.authentication(handlers.sendResponseHandler)).
		Methods("POST")
	router.HandleFunc("/api/v1/responses/{identifier}", handlers.authentication(handlers.getResponsesHandler)).
		Methods("GET")

	log.Fatal(http.ListenAndServe(":8080", router))
}

// contextWithIdentifier prepares a new context with the identifier
// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
func contextWithIdentifier(c context.Context, r *http.Request) context.Context {
	header := r.Header.Get("Authorization")
	split := strings.Split(header, "Bearer")
	identifier := split[1]
	identifier = strings.TrimLeft(identifier, " ")

	return context.WithValue(c, apiID, identifier)
}

// getIdentifierFromContext returns the identifier string from the context
// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
func getIdentifierFromContext(c context.Context) string {
	return c.Value(apiID).(string)
}

// authentication is middleware to check that the responder is authorized to the API
//
// It prepares a new context with the identifier using the functions above and passes
// it to the next handler
func (h *Handler) authentication(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
		c := contextWithIdentifier(r.Context(), r)
		identifier := getIdentifierFromContext(c)

		isStudent, err := h.Authenticate(identifier)

		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}

		if !isStudent {
			log.Println(identifier + " is not an authorized student")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		log.Println(identifier + " is an authorized student")
		next.ServeHTTP(w, r.WithContext(c))
	})
}

// Upon successful authentication, redirect the student to the presenters list
func (h *Handler) authorize(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/v1/presenters", http.StatusSeeOther)
}

// Handle getting the list of presenters
func (h *Handler) presentersListHandler(w http.ResponseWriter, r *http.Request) {
	students, err := h.GetStudents()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	for _, s := range students {
		fmt.Fprintf(w, "%s\n", s.Name)
	}
}

// Handle getting info for a specific presenter
func (h *Handler) presenterHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	presenterID := vars["identifier"]

	presentation, err := h.GetPresentation(presenterID)

	if err != nil {
		panic(err)
	}

	// https://play.golang.org/p/6jHI-MRx0z
	presentationJSON, err := json.MarshalIndent(presentation, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", presentationJSON)

	questions, err := h.GetQuestions()

	if err != nil {
		panic(err)
	}

	questionJSON, err := json.MarshalIndent(questions, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", questionJSON)
}

func (h *Handler) sendResponseHandler(w http.ResponseWriter, r *http.Request) {
	// Get the authenticated user's identifier from the request context
	responderID := getIdentifierFromContext(r.Context())

	vars := mux.Vars(r)
	presenterID := vars["identifier"]

	// Decode the request into a ResponseRequest struct
	response := ResponseRequest{}
	err := json.NewDecoder(r.Body).Decode(&response)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
	}

	h.RespondToQuestion(responderID, presenterID, response.Type, response.Number, response.Answer)

}

func (h *Handler) getResponsesHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())

	vars := mux.Vars(r)
	presenterID := vars["identifier"]

	responses, err := h.GetResponses(responderID, presenterID)

	if err != nil {
		panic(err)
	}

	// https://play.golang.org/p/6jHI-MRx0z
	responsesJSON, err := json.MarshalIndent(responses, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", responsesJSON)

}
