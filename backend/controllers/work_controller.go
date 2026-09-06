package controllers

import (
	"github.com/gin-gonic/gin"

	"logline/database"
	"logline/models"
)

func CreateWork(c *gin.Context) {
	var input models.Work
	c.ShouldBindJSON(&input)
	database.DB.Create(&input)
	c.JSON(200, input)
}

func GetWorks(c *gin.Context) {
	var works []models.Work
	database.DB.Order("created_at desc").Find(&works)
	c.JSON(200, works)
}

func DeleteWork(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Work{}, id)
	c.JSON(200, gin.H{"status": "deleted"})
}

// Новый эндпоинт для редактирования
func EditWork(c *gin.Context) {
	id := c.Param("id")
	var input models.Work
	c.ShouldBindJSON(&input)
	database.DB.Model(&models.Work{}).Where("id = ?", id).Updates(input)
	c.JSON(200, input)
}