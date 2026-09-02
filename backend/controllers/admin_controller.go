package controllers

import (
	"github.com/gin-gonic/gin"

	"logline/database"
	"logline/models"
)

func GetUsers(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(403, gin.H{"error": "Доступ запрещен"})
		return
	}

	var users []models.User
	database.DB.Find(&users).Select("id", "username", "role", "created_at")
	c.JSON(200, users)
}

func GetStats(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(403, gin.H{"error": "Доступ запрещен"})
		return
	}

	var notesCount int64
	var usersCount int64
	database.DB.Model(&models.Note{}).Count(&notesCount)
	database.DB.Model(&models.User{}).Count(&usersCount)

	c.JSON(200, gin.H{"notes": notesCount, "users": usersCount})
}