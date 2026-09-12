package controllers

import (
	"github.com/gin-gonic/gin"

	"logline/database"
	"logline/models"
)

func GetProfileStats(c *gin.Context) {
	userID := c.GetUint("userID")

	// Количество заметок
	var notesCount int64
	database.DB.Model(&models.Note{}).Where("author_id = ?", userID).Count(&notesCount)

	// Количество постов
	var postsCount int64
	database.DB.Model(&models.Post{}).Where("author_id = ?", userID).Count(&postsCount)

	// Количество чатов (друзей)
	var chatsCount int64
	database.DB.Model(&models.ChatMember{}).Where("user_id = ?", userID).Count(&chatsCount)

	// Количество сообщений отправленных
	var messagesCount int64
	database.DB.Model(&models.Message{}).Where("user_id = ?", userID).Count(&messagesCount)

	c.JSON(200, gin.H{
		"notes":    notesCount,
		"posts":    postsCount,
		"chats":    chatsCount,
		"messages": messagesCount,
	})
}
