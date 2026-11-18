package internal

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func TokenAuth(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		prefix_length := len("Token ")
		header := c.GetHeader("Authorization")
		if header == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			return
		}

		if len(header) < prefix_length {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header malformed"})
			return
		}

		token := header[prefix_length:]
		user, err := GetUserByKey(db, token)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
				return
			}

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Set("user", user)

		// Call next handler in chain
		c.Next()

		// Handle any after effects
	}
}
