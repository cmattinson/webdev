/*
	CMPT 315 - Assignment 1
	Author: Chris Mattinson

	This programs handles all of the requests and responses to/from the web server
*/

package main

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// Handler wraps the Database struct
type Handler struct {
	*Database
}

// ResponseRequest stores an incoming question response request
type ResponseRequest struct {
	Type   string `json:"questionType"`
	Number int    `json:"number"`
	Answer string `json:"answer"`
}

// DeleteRequest stores a delete response request
type DeleteRequest struct {
	Type   string `json:"type"`
	Number int    `json:"number"`
}

// Log will be used for encoding terminal logs to JSON
type Log struct {
	URI           string `json:"uri"`
	Method        string `json:"method"`
	RemoteAddress string `json:"remoteAddress"`
	Token         string `json:"token"`
	Duration      string `json:"duration"`
}

// CustomResponse will be used to add custom messages in the response
type CustomResponse struct {
	Message string `json:"message"`
	Code    int    `json:"statusCode"`
	Error   string `json:"error"`
}

// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
type key string

const apiID key = ""

func main() {
	db, err := OpenDatabase()
	if err != nil {
		log.Fatalf("Unable to open database: %v", err)
	}
	defer db.Close()

	handlers := Handler{
		db,
	}

	router := mux.NewRouter()

	// Default case, will be encoded in json
	router.HandleFunc("/api/v1/presenters", handlers.authentication(logger(handlers.presentersListHandler))).
		Methods("GET")
	// Format is specified
	router.HandleFunc("/api/v1/presenters.{format:(?:json|xml)}", handlers.authentication(logger(handlers.presentersListHandler))).
		Methods("GET")

	router.HandleFunc("/api/v1/presenters/{presentation_id:[0-9]+}", handlers.authentication(logger(handlers.presenterHandler))).
		Methods("GET")
	router.HandleFunc("/api/v1/presenters/{presentation_id:[0-9]+}.{format:(?:json|xml)}", handlers.authentication(logger(handlers.presenterHandler))).
		Methods("GET")

	router.HandleFunc("/api/v1/presenters/{presentation_id:[0-9]+}", handlers.authentication(logger(handlers.sendResponseHandler))).
		Methods("POST", "PUT")

	router.HandleFunc("/api/v1/questions", handlers.authentication(logger(handlers.questionsHandler))).Methods("GET")

	router.HandleFunc("/api/v1/presentations", handlers.authentication(logger(handlers.presentationListHandler))).Methods("GET")

	router.HandleFunc("/api/v1/responses/{presentation_id:[0-9]+}", handlers.authentication(logger(handlers.getResponsesHandler))).
		Methods("GET")
	router.HandleFunc("/api/v1/responses/{presentation_id:[0-9]+}.{format:(?:json|xml)}", handlers.authentication(logger(handlers.getResponsesHandler))).
		Methods("GET")

	router.HandleFunc("/api/v1/responses/{presentation_id:[0-9]+}/{question_id}", handlers.authentication(logger(handlers.getResponseHandler))).Methods("GET")

	router.HandleFunc("/api/v1/responses/{presentation_id:[0-9]+}", handlers.authentication(logger(handlers.deleteResponseHandler))).
		Methods("DELETE", "OPTIONS")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("dist")))

	log.Fatal(http.ListenAndServe(":8080", router))
}

// contextWithIdentifier prepares a new request context with the identifier
// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
func contextWithIdentifier(ctx context.Context, r *http.Request) context.Context {
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

	return context.WithValue(ctx, apiID, identifier)
}

// getIdentifierFromContext returns the identifier string from the context
// https://www.joeshaw.org/revisiting-context-and-http-handler-for-go-17/
func getIdentifierFromContext(ctx context.Context) string {
	return ctx.Value(apiID).(string)
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
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			AddCustomResponse(w, "Authentication header required", 401, http.StatusText(401))
			return
		}

		identifier := getIdentifierFromContext(c)
		isStudent, err := h.Authenticate(identifier)

		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			AddCustomResponse(w, "Error authenticating student", 500, http.StatusText(500))
		}

		if !isStudent {
			message := identifier + " is not a recognized identifier"
			AddCustomResponse(w, message, 401, http.StatusText(http.StatusUnauthorized))
			return
		}

		next.ServeHTTP(w, r.WithContext(c))
	})
}

// logger will log HTTP request details to the terminal
func logger(next http.HandlerFunc) http.HandlerFunc {
	logger := Log{}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)

		duration := time.Now().Sub(start).Seconds() * 1000 // in milliseconds
		durationString := fmt.Sprintf("%.2f ms", duration)
		logger.URI = r.RequestURI
		logger.Method = r.Method
		logger.RemoteAddress = r.RemoteAddr
		logger.Token = getIdentifierFromContext(r.Context())
		logger.Duration = durationString

		logJSON, err := json.Marshal(&logger)

		if err != nil {
			log.Println("Error logging request")
		}

		fmt.Printf("%s\n", logJSON)
	})
}

func (h *Handler) authenticate(w http.ResponseWriter, r *http.Request) {

}

// Handle getting the list of presenters
func (h *Handler) presentersListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	format := vars["format"]

	students, err := h.GetPresenters()

	if err != nil {
		log.Fatalf("GetPresenters: %v", err)
	}

	if format == "" {
		EncodeOutput(w, students, "json")
	} else {
		EncodeOutput(w, students, format)
	}
}

// Handle getting info for a specific presenter (Survey form)
func (h *Handler) presenterHandler(w http.ResponseWriter, r *http.Request) {
	// Get the presentation ID from the URL
	presentationID, err := GetPresentationID(r)
	if presentationID == -1 {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		AddCustomResponse(w, "Invalid presentation ID", 401, http.StatusText(http.StatusUnauthorized))
		return
	} else if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	presentation, err := h.GetPresentation(presentationID)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	vars := mux.Vars(r)
	format := vars["format"]

	if format == "" {
		EncodeOutput(w, presentation, "json")
	} else {
		EncodeOutput(w, presentation, format)
	}
}

func (h *Handler) presentationListHandler(w http.ResponseWriter, r *http.Request) {
	presentations, err := h.GetPresentations()

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(r)
	format := vars["format"]

	if format == "" {
		EncodeOutput(w, presentations, "json")
	} else {
		EncodeOutput(w, presentations, format)
	}
}

func (h *Handler) questionsHandler(w http.ResponseWriter, r *http.Request) {
	questions, err := h.GetQuestions()
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(r)
	format := vars["format"]

	if format == "" {
		EncodeOutput(w, questions, "json")
	} else {
		EncodeOutput(w, questions, format)
	}
}

// Send or update a response to a question
func (h *Handler) sendResponseHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())
	presentationID, err := GetPresentationID(r)

	if presentationID == -1 {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		AddCustomResponse(w, "Error parsing presentation ID", 500, http.StatusText(500))
		return
	}

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	// Decode the request into a ResponseRequest struct
	response := ResponseRequest{}
	err = json.NewDecoder(r.Body).Decode(&response)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		AddCustomResponse(w, "Unable to parse response", 400, http.StatusText(400))
		return
	}

	var responseSent bool

	// Inserting a new response
	if r.Method == "POST" {
		respExists, err := h.ResponseExists(responderID, presentationID, response.Type, response.Number)

		if respExists && err == nil {
			http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			AddCustomResponse(w, "Response already exists in the database", 400, http.StatusText(400))
			return
		} else if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			AddCustomResponse(w, err.Error(), 500, http.StatusText(http.StatusInternalServerError))
			return
		} else if !respExists && err == nil {
			responseSent, err = h.RespondToQuestion(responderID, presentationID, response.Type, response.Number, response.Answer)
		}

	} else if r.Method == "PUT" { // Updating an existing response
		responseSent, err = h.UpdateResponse(responderID, presentationID, response.Type, response.Number, response.Answer)
	} else {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		AddCustomResponse(w, "Method must be POST or PUT", 405, http.StatusText(405))
		return
	}

	if !responseSent {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		AddCustomResponse(w, "Unable to send response", 400, http.StatusText(400))
		return
	}

	message := fmt.Sprintf("Response to %s %d sent", response.Type, response.Number)
	AddCustomResponse(w, message, http.StatusOK, "None")
	PrintResponsePayload(w, responderID, presentationID, response.Type, response.Number, response.Answer)
}

func (h *Handler) getResponseHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())
	presentationID, err := GetPresentationID(r)

	if presentationID == -1 {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	vars := mux.Vars(r)
	questionID := vars["question_id"]

	matchMC, _ := regexp.MatchString("mc[0-9]+", questionID)
	matchOpen, _ := regexp.MatchString("open[0-9]+", questionID)

	if !matchMC && !matchOpen {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		AddCustomResponse(w, questionID+" is not a valid question ID", http.StatusBadRequest, http.StatusText(http.StatusBadRequest))
	}

	var questionType string
	var questionNumber int

	// Response is a multiple choice question, parse question number
	if matchMC {
		questionType = "M/C"
		split := strings.Split(questionID, "c")
		questionNumber, err = strconv.Atoi(split[1])
	}

	// Response is an open question, parse question number
	if matchOpen {
		questionType = "Open"
		split := strings.Split(questionID, "n")
		questionNumber, err = strconv.Atoi(split[1])
	}

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	response, err := h.GetResponse(responderID, presentationID, questionType, questionNumber)
	EncodeOutput(w, response, "json")
}

// Get the list of responses
func (h *Handler) getResponsesHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())
	presentationID, err := GetPresentationID(r)

	if presentationID == -1 {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	responses, err := h.GetResponses(responderID, presentationID)

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	vars := mux.Vars(r)
	format := vars["format"]

	if format == "" {
		EncodeOutput(w, responses, "json")
	} else {
		EncodeOutput(w, responses, format)
	}
}

// Delete a response
func (h *Handler) deleteResponseHandler(w http.ResponseWriter, r *http.Request) {
	responderID := getIdentifierFromContext(r.Context())
	presentationID, err := GetPresentationID(r)

	if presentationID == -1 {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	// Decode the request into a DeleteRequest struct
	delete := DeleteRequest{}
	err = json.NewDecoder(r.Body).Decode(&delete)

	deleted, err := h.DeleteResponse(responderID, presentationID, delete.Type, delete.Number)

	// The response does not exist
	if !deleted && err == nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		AddCustomResponse(w, "The response does not exist", 400, http.StatusText(http.StatusBadRequest))
	} else if !deleted && err != nil { // There was an error other than the response not existing
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		AddCustomResponse(w, err.Error(), 500, http.StatusText(http.StatusInternalServerError))
	} else {
		http.Error(w, http.StatusText(http.StatusOK), http.StatusOK)
		AddCustomResponse(w, "Response deleted", 200, "None")
	}
}

// GetPresentationID parses the presentation ID from the http request
func GetPresentationID(r *http.Request) (int, error) {
	vars := mux.Vars(r)
	idFromRequest := vars["presentation_id"]

	presentationID, err := strconv.Atoi(idFromRequest)

	if err != nil {
		return -1, err
	}

	return presentationID, nil
}

// AddCustomResponse will create a JSON response using the CustomResponse struct
func AddCustomResponse(w http.ResponseWriter, message string, code int, errorString string) {
	response := CustomResponse{}

	response.Message = message
	response.Code = code
	response.Error = errorString

	responseJSON, err := json.MarshalIndent(response, "", "    ")

	if err != nil {
		log.Printf("AddResponse: %v", err)
	}

	fmt.Fprintf(w, "%s\n", responseJSON)
}

// PrintResponsePayload will print what is being sent to the Response table to the response writer
func PrintResponsePayload(w http.ResponseWriter, responderID string, presentationID int, questionType string, number int, answer string) {
	payload := Response{}

	payload.ResponderID = responderID
	payload.PresentationID = presentationID
	payload.Type = questionType
	payload.Number = number
	payload.Answer = answer

	payloadJSON, err := json.MarshalIndent(payload, "", "    ")

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}

	fmt.Fprintf(w, "\nPayload\n\n%s\n", payloadJSON)
}

// EncodeOutput will print the output in the desired format to the response writer
func EncodeOutput(w http.ResponseWriter, output interface{}, format string) {
	if format == "json" {
		outputJSON, err := json.MarshalIndent(output, "", "    ")

		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "%s\n", outputJSON)
	} else if format == "xml" {
		outputXML, err := xml.MarshalIndent(output, "", "    ")

		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "%s\n", outputXML)
	} else {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		AddCustomResponse(w, format+" is not supported", 400, http.StatusText(http.StatusBadRequest))
		return
	}
}
