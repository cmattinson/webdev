/*
CMPT 315 (Winter 2019)
Lab #4: Middleware and Encoding/Decoding
Author: Nicholas M. Boers

This file implements the Web server.
*/
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"

	"github.com/gorilla/mux"
)

var port int

type Handler struct {
	*Database
}

func init() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, `usage: %s [-p port]

Options:
`, path.Base(os.Args[0]))
		flag.PrintDefaults()
	}

	flag.IntVar(&port, "p", 8080, "port")

	flag.Parse()
}

func main() {
	connect := "dbname=assess user=postgres host=localhost port=5432 sslmode=disable"
	db, err := OpenDatabase(connect)
	if err != nil {
		log.Fatalf("OpenDatabase: %v", err)
	}
	defer db.Close()

	handlers := Handler{
		db,
	}

	router := mux.NewRouter()
	router.HandleFunc("/api/v1/assessments", handlers.handleGetAssessment)
	router.HandleFunc("/api/v1/assessments/{n:[0-9]+}", handlers.handleGetAccountAssessments)

	portString := fmt.Sprintf(":%d", port)

	log.Fatal(http.ListenAndServe(portString, router))
}

func (h *Handler) handleGetAssessment(w http.ResponseWriter, r *http.Request) {
	assessments, err := h.GetAssessments("")

	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	} else {
		fmt.Fprintf(w, "%v\n", assessments)
	}
}

func (h *Handler) handleGetAccountAssessments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	account := vars["n"]

	accountNumber, err := strconv.Atoi(account)

	fmt.Println(accountNumber)

	assessment, err := h.GetAssessment(accountNumber)

	if err != nil {
		panic(err)
	} else {
		fmt.Fprintf(w, "%v\n", assessment)
	}
}

func middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

	})
}
