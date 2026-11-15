package api_test

import (
	"database/sql"
	"fancylists/internal"
	"fmt"
	"net/http"
	"path/filepath"
	"testing"
)

var TestUser1 = &internal.User{}
var TestUser2 = &internal.User{}

func NewTestDB(t *testing.T) *sql.DB {
	t.Helper()

	// Create DB in temporary directory
	path := filepath.Join(t.TempDir(), "test.db")
	db, err := internal.InitDb(internal.DBConfig{Path: path})
	if err != nil {
		t.Fatalf("Open test db: %v", err)
	}

	// Insert a first user
	user1, err := internal.CreateUser(db, "test_user_1", "password")
	if err != nil {
		t.Fatalf("Failed to create test user 1: %v", err)
	}
	TestUser1 = user1

	// Insert a second user
	user2, err := internal.CreateUser(db, "test_user_2", "password")
	if err != nil {
		t.Fatalf("Failed to create test user 2: %v", err)
	}
	TestUser2 = user2

	t.Cleanup(func() { db.Close() })
	return db
}

func AddUser1AuthHeader(req *http.Request) {
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", TestUser1.Key))
}

func AddUser2AuthHeader(req *http.Request) {
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", TestUser2.Key))
}

func CreateList(t *testing.T, db *sql.DB, name string, owner *internal.User) *internal.FancyList {
	list, err := internal.CreateList(db, name, owner)
	if err != nil {
		t.Fatalf("Failed to create list: %v", err)
	}

	return list
}
