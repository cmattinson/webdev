package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", index)
	router.HandleFunc("/api/auth", authHandler)

	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}

func index(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/api/auth", http.StatusSeeOther)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Authentication page")
}
