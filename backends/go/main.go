package main

import (
	"fancylists/internal"
	"log"
)

func main() {
	// Init database
	db, err := internal.InitDb(internal.DBConfig{})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Seed data for testing purposes
	_, err = internal.SeedDb(db)
	if err != nil {
		log.Fatal(err)
	}

	// Init router
	router := internal.GetRouter(db)

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	if err := router.Run("localhost:8000"); err != nil {
		log.Fatal(err)
	}
}
