package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// Handler wraps the Database struct
type Handler struct {
	*Database
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
		Methods("GET")
	router.HandleFunc("/api/v1/presenters", handlers.authentication(handlers.presentersListHandler)).
		Methods("GET")
	router.HandleFunc("/api/v1/presenters/{presentation_id}", handlers.authentication(handlers.presenterHandler)).
		Methods("GET")
	router.HandleFunc("/api/v1/presenters/{presentation_id}", handlers.authentication(handlers.sendResponseHandler)).
		Methods("POST")
	router.HandleFunc("/api/v1/responses/{presentation_id}", handlers.authentication(handlers.getResponsesHandler)).
		Methods("GET")

	log.Fatal(http.ListenAndServe(":8080", router))
}

// contextWithIdentifier prepares a new context with the identifier
// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
func contextWithIdentifier(c context.Context, r *http.Request) context.Context {
	header := r.Header.Get("Authorization")

	// No authorization header passed
	if header == "" {
		return nil
	}

	split := strings.Split(header, "Bearer")

	// Bearer token not passed
	if len(split) == 1 {
		return nil
	}

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

		// Authorization header was not included with the request
		if c == nil {
			w.Header().Set("WWW-Authenticate", "Bearer: identifier")
			w.WriteHeader(401)
			return
		}

		identifier := getIdentifierFromContext(c)

		isStudent, err := h.Authenticate(identifier)

		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}

		if !isStudent {
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r.WithContext(c))
	})
}

// Upon successful authentication, redirect the student to the presenters list
func (h *Handler) authorize(w http.ResponseWriter, r *http.Request) {
	log.Println("Student authorized")
	http.Error(w, http.StatusText(http.StatusFound), http.StatusFound)
}

// Handle getting the list of presenters
func (h *Handler) presentersListHandler(w http.ResponseWriter, r *http.Request) {
	students, err := h.GetPresenters()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	studentJSON, err := json.MarshalIndent(students, "", "    ")

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "%s\n", studentJSON)
}

// Handle getting info for a specific presenter
func (h *Handler) presenterHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idFromRequest := vars["presentation_id"]

	presentationID, err := strconv.Atoi(idFromRequest)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	presentation, err := h.GetPresentation(presentationID)

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
	idFromRequest := vars["presentation_id"]

	presentationID, err := strconv.Atoi(idFromRequest)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	// Decode the request into a ResponseRequest struct
	response := ResponseRequest{}
	err = json.NewDecoder(r.Body).Decode(&response)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
	}

	responseSent, err := h.RespondToQuestion(responderID, presentationID, response.Type, response.Number, response.Answer)

	if err != nil {
		log.Printf("%v\n", err)
	}

	if !responseSent {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
	}
}

func (h *Handler) getResponsesHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())

	vars := mux.Vars(r)
	idFromRequest := vars["presentation_id"]

	presentationID, err := strconv.Atoi(idFromRequest)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	responses, err := h.GetResponses(responderID, presentationID)

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
