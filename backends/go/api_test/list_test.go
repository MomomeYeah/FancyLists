package api_test

import (
	"encoding/json"
	"fancylists/internal"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

var nonexistentID = 999999999
var invalidID = "invalid"

func TestGetUserLists(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	// Create two new lists
	_ = CreateList(t, db, "List 1", TestUser1)
	_ = CreateList(t, db, "List 2", TestUser1)

	req := httptest.NewRequest(http.MethodGet, "/api/lists", nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusOK, w.Body)
	}

	lists := []*internal.FancyList{}
	if err := json.Unmarshal(w.Body.Bytes(), &lists); err != nil {
		t.Fatalf("Decode response: %v", err)
	}

	if len(lists) != 2 {
		t.Fatalf("Got %d results, expected %d", len(lists), 6)
	}

	for i, list := range lists {
		expectedDisplayOrder := (i + 1) * 10
		if list.DisplayOrder != expectedDisplayOrder {
			t.Fatalf("Got display order %d, want %d", list.DisplayOrder, expectedDisplayOrder)
		}
	}
}

func TestGetList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	list1 := CreateList(t, db, "List 1", TestUser1)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/lists/%d/", list1.Id), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusOK, w.Body)
	}

	var list *internal.FancyList
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("Decode response: %v", err)
	}

	if list.Name != "List 1" {
		t.Fatalf("Got name %s, want %s", list.Name, "List 1")
	}

	if list.Owner != TestUser1.Id {
		t.Fatalf("Got owner %d, want %d", list.Owner, TestUser1.Id)
	}

	if list.DisplayOrder != 10 {
		t.Fatalf("Got display order %d, want %d", list.DisplayOrder, 10)
	}
}

func TestGetListInvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/lists/%s/", invalidID), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusBadRequest, w.Body)
	}
}

func TestGetListDoesNotExist(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/lists/%d/", nonexistentID), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNotFound, w.Body)
	}
}

func TestGetListOwnerDoesNotMatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	list1 := CreateList(t, db, "List 1", TestUser1)

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/lists/%d/", list1.Id), nil)
	AddUser2AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNotFound, w.Body)
	}
}

func TestCreateList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	body := map[string]string{
		"name": "List 1",
	}
	req := httptest.NewRequest(http.MethodPost, "/api/lists/", GetPostBody(t, body))
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusCreated, w.Body)
	}

	var list *internal.FancyList
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("Decode response: %v", err)
	}

	if list.Name != "List 1" {
		t.Fatalf("Got name %s, want %s", list.Name, "List 1")
	}

	if list.Owner != TestUser1.Id {
		t.Fatalf("Got owner %d, want %d", list.Owner, TestUser1.Id)
	}

	if list.DisplayOrder != 10 {
		t.Fatalf("Got display order %d, want %d", list.DisplayOrder, 10)
	}
}

func TestDeleteList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	// Create a list
	list := CreateList(t, db, "List 1", TestUser1)

	// Delete the list
	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/lists/%d/", list.Id), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNoContent, w.Body)
	}

	// Attempt to retrieve it again
	req = httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/lists/%d/", list.Id), nil)
	AddUser1AuthHeader(req)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNotFound, w.Body)
	}
}

func TestDeleteListInvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/lists/%s/", invalidID), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusBadRequest, w.Body)
	}
}

func TestDeleteListDoesNotExist(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/lists/%d/", nonexistentID), nil)
	AddUser1AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNotFound, w.Body)
	}
}

func TestDeleteListOwnerDoesNotMatch(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := NewTestDB(t)
	router := internal.GetRouter(db)

	// Create the list with user 1
	list := CreateList(t, db, "List 1", TestUser1)

	// Attempt to delete the list with user 2
	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/lists/%d/", list.Id), nil)
	AddUser2AuthHeader(req)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Got status %d, want %d, %v", w.Code, http.StatusNotFound, w.Body)
	}
}
