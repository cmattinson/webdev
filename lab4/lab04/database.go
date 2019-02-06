/*
CMPT 315 (Winter 2019)
Lab #4: Middleware and Encoding/Decoding
Author: Nicholas M. Boers

This file implements the data access functions.
*/
package main

import (
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"

	_ "github.com/lib/pq"
)

type Database struct {
	*sqlx.DB
}

type Assessment struct {
	Account int    `db:"account"`
	Address string `db:"address"`
	Value   int    `db:"value"`
}

// RecordLimit specifies the maximum number of records to obtain -- it's
// here to ensure that a request doesn't dump the entire database
const RecordLimit int = 10

// OpenDatabase attempts to open the database specified by 'connect'
// and returns a handle to it
func OpenDatabase(connect string) (*Database, error) {
	db := Database{}
	var err error

	db.DB, err = sqlx.Connect("postgres", connect)
	if err != nil {
		return nil, fmt.Errorf("Connect (%v): %v", connect, err)
	}

	return &db, nil
}

// GetAssessment obtains an assessment for 'accountNumber'
func (db *Database) GetAssessment(accountNumber int) (Assessment, error) {
	q := `SELECT account, address, value
                FROM assessment
               WHERE account = $1`
	assessment := Assessment{}

	if err := db.Get(&assessment, q, accountNumber); err != nil {
		return Assessment{}, err
	}

	return assessment, nil
}

// GetAssessments obtains a slice of assessments that contain 'substring'
// in their address
func (db *Database) GetAssessments(substring string) ([]Assessment, error) {
	q := `SELECT account, address, value
                FROM assessment
               WHERE address LIKE UPPER($1)
            ORDER BY address
               LIMIT $2`
	assessments := []Assessment{}

	// add % to either end to find a substring
	if !strings.HasPrefix(substring, "%") {
		substring = "%" + substring
	}
	if !strings.HasSuffix(substring, "%") {
		substring = substring + "%"
	}

	if err := db.Select(&assessments, q, substring, RecordLimit); err != nil {
		return nil, fmt.Errorf("Select: %v", err)
	}

	return assessments, nil
}
