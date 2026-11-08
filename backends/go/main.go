package main

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

	// Auth routes
	auth := router.Group("/auth")
	auth.POST("/login/", func(c *gin.Context) {
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
	auth.POST("/registration/", func(c *gin.Context) {
		var newUser struct {
			Username  string `json:"username"`
			Password1 string `json:"password1"`
			Password2 string `json:"password2"`
		}
		if err := c.ShouldBindJSON(&newUser); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if newUser.Password1 != newUser.Password2 {
			c.JSON(http.StatusBadRequest, gin.H{"non_field_errors": "Passwords must match."})
			return
		}

		_, ok := AppUsers[newUser.Username]
		if ok {
			c.JSON(http.StatusBadRequest, gin.H{"non_field_errors": "User already exists."})
			return
		}

		AppUsers[newUser.Username] = User{
			Username: newUser.Username,
			Password: newUser.Password1,
			Key:      rand.Text(),
		}

		fmt.Println(AppUsers[newUser.Username])

		c.JSON(http.StatusOK, AppUsers[newUser.Username])
	})

	// List routes
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
	lists.GET("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		list := GetUserList(*user, parsedId)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Item does not belong to request user."})
			return
		}

		c.JSON(http.StatusOK, list)
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
			Id:           NextId(),
			Name:         list.Name,
			CreatedDate:  time.Now(),
			Owner:        *user,
			DisplayOrder: (len(AppLists[*user]) + 1) * 10,
		}
		AppLists[*user] = append(AppLists[*user], &FancyList)
		c.JSON(http.StatusCreated, FancyList)
	})
	lists.PATCH("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		list := GetUserList(*user, parsedId)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Item does not belong to request user."})
			return
		}

		payload := UpdateReorderablePayload{
			Name:         list.Name,
			DisplayOrder: list.DisplayOrder,
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		UpdateList(list, payload)
		c.JSON(http.StatusOK, list)
	})
	lists.DELETE("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		AppLists[*user] = DeleteReorderable(AppLists[*user], parsedId)
		c.Status(http.StatusNoContent)
	})

	// Category routes
	categories := router.Group("/api/categories")
	categories.POST("/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		var category struct {
			Name string
			List int
		}
		if err := c.ShouldBindJSON(&category); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		list := GetUserList(*user, category.List)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Item does not belong to request user."})
			return
		}

		newCategory := CreateCategory(category.Name, list)
		c.JSON(http.StatusCreated, newCategory)
	})
	categories.PATCH("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		category := AllCategories[parsedId]
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		list := GetUserList(*user, category.FancyList)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Category does not belong to request user."})
			return
		}

		payload := UpdateReorderablePayload{
			Name:         category.Name,
			DisplayOrder: category.DisplayOrder,
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		UpdateCategory(category, payload)
		c.JSON(http.StatusOK, category)
	})
	categories.DELETE("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		category := AllCategories[parsedId]
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		list := GetUserList(*user, category.FancyList)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Category does not belong to request user."})
			return
		}

		DeleteCategory(category)
		c.Status(http.StatusNoContent)
	})

	// Item routes
	items := router.Group("/api/items")
	items.POST("/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		var item struct {
			Name     string
			Category int
		}
		if err := c.ShouldBindJSON(&item); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		category := AllCategories[item.Category]
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		list := GetUserList(*user, category.FancyList)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Item does not belong to request user."})
			return
		}

		newItem := CreateItem(item.Name, category)
		c.JSON(http.StatusCreated, newItem)
	})
	// TODO: Update item categories
	items.PATCH("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		item := AllItems[parsedId]
		if item == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found."})
			return
		}
		category := AllCategories[item.Category]
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		list := GetUserList(*user, category.FancyList)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Category does not belong to request user."})
			return
		}

		payload := UpdateReorderablePayload{
			Name:         item.Name,
			DisplayOrder: item.DisplayOrder,
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		UpdateItem(item, payload)
		c.JSON(http.StatusOK, item)
	})
	items.DELETE("/:id/", func(c *gin.Context) {
		user := getAuthToken(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		item := AllItems[parsedId]
		if item == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found."})
			return
		}
		category := AllCategories[item.Category]
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		list := GetUserList(*user, category.FancyList)
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Category does not belong to request user."})
			return
		}

		DeleteItem(item)
		c.Status(http.StatusNoContent)
	})

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run("localhost:8000")
}
