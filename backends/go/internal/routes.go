package internal

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func getAuthUser(c *gin.Context, db *sql.DB) (*User, error) {
	prefix_length := len("Token ")
	header := c.GetHeader("Authorization")
	if header == "" {
		return nil, errors.New("Authorization header missing")
	}

	if len(header) < prefix_length {
		return nil, errors.New("Authorization header malformed")
	}

	token := header[prefix_length:]
	user, err := GetUserByKey(db, token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("User not found")
		}
		return nil, err
	}

	fmt.Println("Got user", user.Username, "from", header)

	return user, nil
}

func GetRouter(db *sql.DB) *gin.Engine {
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

		requestUser, err := GetUserByUsername(db, user.Username)
		if err != nil {
			fmt.Println(err.Error())
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

		// TODO: check username doesn't exist
		if newUser.Password1 != newUser.Password2 {
			c.JSON(http.StatusBadRequest, gin.H{"non_field_errors": "Passwords must match."})
			return
		}

		user, err := CreateUser(db, newUser.Username, newUser.Password1)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"non_field_errors": "Unable to register user"})
			return
		}

		c.JSON(http.StatusOK, user)
	})

	// List routes
	// TODO: every endpoint needs to check ownership
	lists := router.Group("/api/lists")
	lists.GET("", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		lists, err := GetUserLists(db, *user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"Error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, lists)
	})
	lists.GET("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		// TODO: could check "not found" from "does not exist" separately here
		// Maybe GetUserList -> GetListDetails?
		list, err := GetUserList(db, *user, parsedId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List not found."})
			return
		}

		c.JSON(http.StatusOK, list)
	})
	lists.POST("/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		var payload struct {
			Name string
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		list, err := CreateList(db, payload.Name, user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, list)
	})
	lists.PATCH("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		list, err := GetListById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		payload := BaseReorderablePayload{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		list = UpdateList(db, list, user, &payload)
		c.JSON(http.StatusOK, list)
	})
	lists.DELETE("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		list, err := GetListById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		DeleteList(db, list, user)
		c.Status(http.StatusNoContent)
	})

	// Category routes
	categories := router.Group("/api/categories")
	categories.POST("/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
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
		list, err := GetListById(db, category.List)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if list == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		newCategory, err := CreateCategory(db, category.Name, list.Id)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, newCategory)
	})
	categories.PATCH("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		category, list, err := GetCategoryById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		payload := BaseReorderablePayload{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		category = UpdateCategory(db, category, list, &payload)
		c.JSON(http.StatusOK, category)
	})
	categories.DELETE("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		category, list, err := GetCategoryById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		DeleteCategory(db, category, list)
		c.Status(http.StatusNoContent)
	})

	// Item routes
	items := router.Group("/api/items")
	items.POST("/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
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

		category, list, err := GetCategoryById(db, item.Category)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		newItem, err := CreateItem(db, item.Name, category.Id)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, newItem)
	})
	items.PATCH("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		item, category, list, err := GetItemById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if item == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		payload := UpdateItemPayload{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		item = UpdateItem(db, item, category, &payload)
		c.JSON(http.StatusOK, item)
	})
	items.DELETE("/:id/", func(c *gin.Context) {
		user, err := getAuthUser(c, db)
		if user == nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"non_field_errors": "Invalid authorization."})
			return
		}

		id := c.Param("id")
		parsedId, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID."})
			return
		}

		item, category, list, err := GetItemById(db, parsedId)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		if item == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found."})
			return
		}
		if list.Owner != user.Id {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "List does not belong to request user."})
			return
		}

		DeleteItem(db, item, category)
		c.Status(http.StatusNoContent)
	})

	return router
}
