package ws

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"logline/config"
)

// ParseToken — вытаскивает userID из JWT
func ParseToken(tokenString string) (uint, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(config.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return 0, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, errors.New("no user_id in token")
	}

	return uint(userIDFloat), nil
}
