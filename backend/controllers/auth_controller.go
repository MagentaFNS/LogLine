package controllers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"logline/config"
	"logline/database"
	"logline/models"
)

func Register(c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	role := "user"
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		role = "admin"
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := models.User{Username: input.Username, Password: string(hashedPassword), Role: role}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(400, gin.H{"error": "Пользователь уже существует"})
		return
	}

	c.JSON(200, user)
}

func Login(c *gin.Context) {
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	database.DB.Where("username = ?", input.Username).First(&user)
	if user.ID == 0 {
		c.JSON(401, gin.H{"error": "Пользователь не найден"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Неверный пароль"})
		return
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(config.JWTSecret))

	c.JSON(200, gin.H{"token": tokenString, "user": user})
}

// UpdateProfile - редактирование профиля
func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	var input struct {
		Username string `json:"username"`
		Bio      string `json:"bio"`
	}
	c.ShouldBindJSON(&input)

	var user models.User
	database.DB.First(&user, userID)
	user.Username = input.Username
	user.Bio = input.Bio
	database.DB.Save(&user)

	c.JSON(200, user)
}

// SearchUsers - поиск пользователей по имени
func SearchUsers(c *gin.Context) {
	query := c.Query("q")
	var users []models.User
	database.DB.Where("username ILIKE ?", "%"+query+"%").Find(&users)
	c.JSON(200, users)
}

// GetUserByID - получить пользователя по ID
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	database.DB.First(&user, id)
	c.JSON(200, user)
}