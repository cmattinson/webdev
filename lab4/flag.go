/*
CMPT 315 (Winter 2019)
Lab #4: Middleware and Encoding/Decoding
Author: Nicholas M. Boers

This file demonstrates handling command-line arguments.
*/
package main

import (
	"flag"
	"fmt"
)

func main() {
	var verbose bool
	var silent bool

	flag.BoolVar(&verbose, "v", false, "enable verbose output")
	flag.BoolVar(&silent, "s", false, "silence output")

	flag.Parse()

	fmt.Printf("verbose: %v\nsilent: %v\n", verbose, silent)
}
