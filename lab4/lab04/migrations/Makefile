# CMPT 315 (Winter 2019)
# Lab #4: Middleware and Encoding/Decoding
# Author: Nicholas M. Boers
#
# Sample Makefile for building custom 'goose' binary that can
# handle .go migrations.

# connect is used as the connect string for PostgreSQL
connect = user=postgres dbname=assess sslmode=disable

.PHONY: clean all up down

all: goose simplified.csv

up: all
	./goose postgres "$(connect)" up

down: goose
	./goose postgres "$(connect)" down

goose: *.go
	go build -o goose *.go

simplified.csv: data.csv
	./simplify.sh

clean:
	$(RM) goose simplified.csv
