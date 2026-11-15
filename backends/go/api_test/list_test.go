package api_test

import (
	"encoding/json"
	"fancylists/internal"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

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
