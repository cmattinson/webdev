#!/bin/bash

# CMPT 315 (Winter 2019)
# Author: Nicholas M. Boers
#
# This script creates a database within the user's directory and runs
# PostgreSQL using that database. It assumes that the system isn't
# already running a PostgreSQL server on port 5432.
#
# -- WARNING -- WARNING -- WARNING -- WARNING -- WARNING -- WARNING --
# This script creates the database with the authentication method
# "trust". Any user that can connect to the server (using TCP or the
# UNIX domain socket) can access the database as its super-user.
# -- WARNING -- WARNING -- WARNING -- WARNING -- WARNING -- WARNING --

# directory within the user's home directory for th database
DIR=postgres_local

function stop_existing_instances() {
    if pg_ctl -D "$HOME/$DIR" status &> /dev/null; then
	pg_ctl -D "$HOME/$DIR" stop || return
    fi

    if ps -C postgres &> /dev/null; then
	killall postgres
    fi
}

function cleanup_old_configuration() {
    if [ -d "$DIR" ]; then
	read -p "Remove existing '$DIR' directory (Y/N)? " to_remove
	case "$to_remove" in
	    [yY])
		rm -rfv "$DIR" || return
		;;
	    *)
		echo "Keeping existing directory."
		;;
	esac
    fi
}

function create_database() {
    if [ ! -d "$HOME/$DIR" ]; then
	initdb -U postgres --pwfile=<(echo) -D "$HOME/$DIR" -A trust
    fi
}

function update_configuration_file() {
    sed -i.bak -E "/unix_socket_directories\s*=/ c\
unix_socket_directories = '/tmp'	# comma-separated list of directories
" "$DIR/postgresql.conf"
}

function start_postgres() {
    pg_ctl -D "$HOME/$DIR" start
}

function wait_for_shutdown() {
    echo -ne "Database successfully created in $DIR and PostgreSQL server started.\n\n"

    read -p "Press <Enter> to shutdown server"
    stop_existing_instances
}

cd "$HOME"

stop_existing_instances \
    && cleanup_old_configuration \
    && create_database \
    && update_configuration_file \
    && start_postgres \
    && wait_for_shutdown \
	|| { echo "An error occurred. Aborting script." >&2; exit 1; }
