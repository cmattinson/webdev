#!/bin/bash

# CMPT 315 (Winter 2019)
# Lab #4: Middleware and Encoding/Decoding
# Author: Nicholas M. Boers
#
# This script generates simplified.csv from data.csv.

awk  -F, '
1-NR {
  gsub(/\$/, "", $5)
  printf("%d,\"%s%s%s\",%s\n", $1, $2 ? $2 "-" : "", $3 ? $3 " " : "", $4, $5)
}' data.csv > simplified.csv
