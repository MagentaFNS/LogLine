package controllers

import (
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"logline/database"
	"logline/models"
)

func UploadAvatar(c *gin.Context) {
	userID := c.GetUint("userID")
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(400, gin.H{"error": "Файл не найден"})
		return
	}

	filename := "avatar_" + strconv.Itoa(int(userID)) + filepath.Ext(file.Filename)
	dst := "./uploads/" + filename
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(500, gin.H{"error": "Ошибка сохранения файла"})
		return
	}

	var user models.User
	database.DB.First(&user, userID)
	user.Avatar = "http://localhost:8080/uploads/" + filename
	database.DB.Save(&user)

	c.JSON(200, gin.H{"avatar": user.Avatar})
}

func CreatePost(c *gin.Context) {
	userID := c.GetUint("userID")
	var input struct {
		Content string `json:"content"`
		Image   string `json:"image"`
		Code    string `json:"code"`
	}
	c.ShouldBindJSON(&input)

	var user models.User
	database.DB.First(&user, userID)

	post := models.Post{
		Content:  input.Content,
		AuthorID: userID,
		Username: user.Username,
		Avatar:   user.Avatar,
		Image:    input.Image,
		Code:     input.Code,
	}
	database.DB.Create(&post)

	c.JSON(200, post)
}

func GetPosts(c *gin.Context) {
	var posts []models.Post
	database.DB.Order("created_at desc").Find(&posts)
	c.JSON(200, posts)
}

// Лайк с возможностью убрать (двойной клик)
func LikePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Model(&models.Post{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + 1"))
	c.JSON(200, gin.H{"status": "liked"})
}

func UnlikePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Model(&models.Post{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes - 1"))
	c.JSON(200, gin.H{"status": "unliked"})
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Post{}, id)
	c.JSON(200, gin.H{"status": "deleted"})
}

func UploadPostImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(400, gin.H{"error": "Файл не найден"})
		return
	}

	filename := "post_" + strconv.FormatInt(time.Now().Unix(), 10) + filepath.Ext(file.Filename)
	dst := "./uploads/" + filename
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(500, gin.H{"error": "Ошибка сохранения файла"})
		return
	}

	c.JSON(200, gin.H{"image": "http://localhost:8080/uploads/" + filename})
}

func GetNotifications(c *gin.Context) {
	userID := c.GetUint("userID")
	var notifications []models.Notification
	database.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&notifications)
	c.JSON(200, notifications)
}

func MarkAllNotificationsRead(c *gin.Context) {
	userID := c.GetUint("userID")
	database.DB.Model(&models.Notification{}).Where("user_id = ?", userID).Update("is_read", true)
	c.JSON(200, gin.H{"status": "ok"})
}