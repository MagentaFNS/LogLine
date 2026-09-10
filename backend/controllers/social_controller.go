package controllers

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"logline/database"
	"logline/models"
)

// Нормализует аватар: "http://.../uploads/avatar_1.png" → "avatar_1.png"
func normalizeAvatar(raw string) string {
	if raw == "" {
		return ""
	}
	if strings.HasPrefix(raw, "http") {
		parts := strings.Split(raw, "/uploads/")
		if len(parts) == 2 {
			return parts[1]
		}
		return ""
	}
	return raw
}

func UploadAvatar(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	database.DB.First(&user, userID)

	// Удаляем старую аватарку
	if user.Avatar != "" {
		oldName := normalizeAvatar(user.Avatar)
		if oldName != "" {
			_ = os.Remove("./uploads/" + oldName)
		}
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(400, gin.H{"error": "Файл не найден"})
		return
	}

	filename := "avatar_" + strconv.Itoa(int(userID)) + filepath.Ext(file.Filename)
	dst := "./uploads/" + filename

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(500, gin.H{"error": "Ошибка сохранения"})
		return
	}

	// Сохраняем ТОЛЬКО имя файла
	user.Avatar = filename
	database.DB.Save(&user)

	c.JSON(200, gin.H{"avatar": filename})
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
		Image:    input.Image,
		Code:     input.Code,
		AuthorID: userID,
		Username: user.Username,
		Avatar:   normalizeAvatar(user.Avatar), // ✅ всегда имя файла
	}
	database.DB.Create(&post)
	c.JSON(200, post)
}

func GetPosts(c *gin.Context) {
	var posts []models.Post
	database.DB.Order("created_at desc").Find(&posts)

	// ✅ На лету чистим URL у старых записей
	for i := range posts {
		posts[i].Avatar = normalizeAvatar(posts[i].Avatar)
	}

	c.JSON(200, posts)
}

func LikePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Model(&models.Post{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + 1"))
	c.JSON(200, gin.H{"status": "liked"})
}

func UnlikePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Model(&models.Post{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("GREATEST(likes - 1, 0)"))
	c.JSON(200, gin.H{"status": "unliked"})
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Post{}, id)
	c.JSON(200, gin.H{"status": "deleted"})
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

func UploadPostImage(c *gin.Context) {
	c.JSON(200, gin.H{"status": "not implemented"})
}
