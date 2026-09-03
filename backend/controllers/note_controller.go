package controllers

import (
	"github.com/gin-gonic/gin"

	"logline/database"
	"logline/models"
)

func GetNotes(c *gin.Context) {
	var notes []models.Note
	database.DB.Find(&notes)
	c.JSON(200, notes)
}

func CreateNote(c *gin.Context) {
	userID := c.GetUint("userID")
	var input models.Note
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	note := models.Note{Title: input.Title, Content: input.Content, AuthorID: userID}
	database.DB.Create(&note)
	c.JSON(200, note)
}

func DeleteNote(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Note{}, id)
	c.JSON(200, gin.H{"status": "deleted"})
}

// Добавляем статистику
func GetNoteStats(c *gin.Context) {
	var count int64
	var categories int64
	database.DB.Model(&models.Note{}).Count(&count)
	database.DB.Model(&models.Note{}).Distinct("title").Count(&categories)

	c.JSON(200, gin.H{"total_notes": count, "categories": categories})
}