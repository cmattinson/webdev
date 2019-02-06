/*
CMPT 315 (Winter 2019)
Lab #4: Middleware and Encoding/Decoding
Author: Nicholas M. Boers

This file implements the population of the database.
*/
package main

import (
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"os"

	"github.com/pressly/goose"
)

func init() {
	goose.AddMigration(Up20190205131919, Down20190205131919)
}

// Up20190205131919 opens a file with CSV data and imports those data
// into an SQL database
func Up20190205131919(tx *sql.Tx) error {
	file, err := os.Open("simplified.csv")
	if err != nil {
		return err
	}
	defer file.Close()

	count := 0 // introduce a counter for providing feedback

	// loop through the records, inserting each into the database
	reader := csv.NewReader(file)
	rec, err := reader.Read()
	for err == nil {
		// insert the record into the database
		q := `INSERT INTO assessment (account, address, value)
                           VALUES ($1, $2, $3)`
		_, err = tx.Exec(q, rec[0], rec[1], rec[2])
		if err != nil {
			return err
		}

		// provide feedback to the user
		count += 1
		if count%10000 == 0 {
			fmt.Printf("Imported %d records...\n", count)
		}

		rec, err = reader.Read()
	}

	// check for a serious error
	if err != nil && err != io.EOF {
		return err
	}

	return nil
}

// Down20190205131919 deletes all of the records from the assessment
// table
func Down20190205131919(tx *sql.Tx) error {
	q := `DELETE FROM assessment`
	_, err := tx.Exec(q)
	if err != nil {
		return err
	}

	return nil
}
