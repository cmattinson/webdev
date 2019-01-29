package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

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
