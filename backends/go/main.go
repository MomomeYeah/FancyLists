package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func getAuthToken(c *gin.Context) *User {
	substr := len("Token ")
	header := c.GetHeader("Authorization")
	token := header[substr:]
	user := GetUserByKey(token)
	fmt.Println("Got user", user.Username, "from", header)

	return user
}

func main() {
	// Creates a gin router with default middleware:
	// - logger and recovery (crash-free) middleware

	router := gin.Default()
	// Apply CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// TODO: User register
	router.POST("/auth/login/", func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		requestUser, ok := AppUsers[user.Username]
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Unable to log in with provided credentials."})
			return
		}

		if user.Password != requestUser.Password {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Unable to log in with provided credentials."})
			return
		}

		fmt.Println(requestUser, "logged in")
		c.JSON(http.StatusOK, gin.H{"key": requestUser.Key})
	})

	lists := router.Group("/api/lists")
	lists.GET("", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		userLists := AppLists[*user]
		if userLists == nil {
			userLists = []*FancyList{}
		}
		c.JSON(http.StatusOK, userLists)
	})
	lists.POST("/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		var list struct {
			Name string
		}
		if err := c.ShouldBindJSON(&list); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		FancyList := FancyList{
			Id:           uuid.New(),
			Name:         list.Name,
			CreatedDate:  time.Now(),
			Owner:        *user,
			DisplayOrder: (len(AppLists[*user]) + 1) * 10,
		}
		AppLists[*user] = append(AppLists[*user], &FancyList)
		for _, list := range AppLists[*user] {
			fmt.Println(list.Name, list.DisplayOrder)
		}
		c.JSON(http.StatusCreated, FancyList)
	})
	// TODO: If name provided, allow update
	// TODO: Return the updated item
	lists.PATCH("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedUUID, err := uuid.Parse(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID."})
			return
		}

		list := GetUserReorderable(AppLists, *user, parsedUUID)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Item does not belong to request user."})
			return
		}

		var payload struct {
			Name         string `json:"name,omitempty"`
			DisplayOrder int    `json:"display_order,omitempty"`
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		UpdateReorderable(list, payload)

		AppLists[*user] = MoveReorderable(AppLists[*user], parsedUUID, payload.DisplayOrder)
		for _, list := range AppLists[*user] {
			fmt.Println(list.Name, list.DisplayOrder)
		}
		c.JSON(http.StatusOK, gin.H{})
	})
	lists.DELETE("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedUUID, err := uuid.Parse(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID."})
			return
		}

		AppLists[*user] = DeleteReorderable(AppLists[*user], parsedUUID)
		for _, list := range AppLists[*user] {
			fmt.Println(list.Name, list.DisplayOrder)
		}
		c.Status(http.StatusNoContent)
	})

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run("localhost:8000")
}
