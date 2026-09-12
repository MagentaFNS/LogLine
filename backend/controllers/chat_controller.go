package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"logline/database"
	"logline/models"
	"logline/ws"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(r *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// ============== WEBSOCKET ==============

func HandleWebSocket(hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("token")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "нет токена"})
			return
		}
		userID, err := ws.ParseToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "неверный токен"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("❌ WS upgrade error: %v", err)
			return
		}

		client := &ws.Client{
			Hub:    hub,
			Conn:   conn,
			Send:   make(chan []byte, 256),
			UserID: userID,
		}

		var chatIDs []uint
		database.DB.Model(&models.ChatMember{}).
			Where("user_id = ?", userID).
			Pluck("chat_id", &chatIDs)

		log.Printf("🔵 [WS] userID=%d подписывается на чаты: %v", userID, chatIDs)

		hub.Register(client, chatIDs)

		database.DB.Model(&models.User{}).
			Where("id = ?", userID).
			Update("last_seen", time.Now())

		go client.WritePump()
		client.ReadPump()

		log.Printf("🔴 [WS] userID=%d отключён", userID)
		database.DB.Model(&models.User{}).
			Where("id = ?", userID).
			Update("last_seen", time.Now())
	}
}

// ============== HANDLE INCOMING EVENTS ==============

func SetupHubCallbacks(hub *ws.Hub) {
	hub.OnMessage = func(userID, _ uint, raw []byte) {
		log.Printf("🎯 [OnMessage] userID=%d, raw=%s", userID, string(raw))

		var msg ws.IncomingMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("❌ [OnMessage] unmarshal error: %v", err)
			return
		}

		log.Printf("🎯 [OnMessage] type=%q, chatID=%d", msg.Type, msg.ChatID)

		switch msg.Type {
		case "message:send":
			handleSendMessage(hub, userID, msg)
		case "typing:start":
			handleTyping(hub, userID, msg.ChatID, true)
		case "typing:stop":
			handleTyping(hub, userID, msg.ChatID, false)
		case "message:read":
			handleReadMessage(hub, userID, msg.ChatID)
		default:
			log.Printf("⚠️ [OnMessage] неизвестный тип: %q", msg.Type)
		}
	}
}

func handleSendMessage(hub *ws.Hub, userID uint, msg ws.IncomingMessage) {
	log.Printf("📩 [handleSendMessage] userID=%d, chatID=%d, content=%q",
		userID, msg.ChatID, msg.Content)

	if msg.ChatID == 0 {
		log.Println("❌ [handleSendMessage] chatID = 0")
		return
	}
	if msg.Content == "" {
		log.Println("❌ [handleSendMessage] content пустой")
		return
	}

	var member models.ChatMember
	if err := database.DB.Where("chat_id = ? AND user_id = ?", msg.ChatID, userID).
		First(&member).Error; err != nil {
		log.Printf("❌ [handleSendMessage] user %d не в чате %d: %v", userID, msg.ChatID, err)
		return
	}

	log.Printf("✅ [handleSendMessage] user %d в чате %d", userID, msg.ChatID)

	message := models.Message{
		ChatID:      msg.ChatID,
		UserID:      userID,
		Content:     msg.Content,
		Type:        "text",
		ReplyToID:   msg.ReplyToID,
		ClientMsgID: msg.ClientMsgID,
	}
	if err := database.DB.Create(&message).Error; err != nil {
		log.Printf("❌ [handleSendMessage] create error: %v", err)
		return
	}
	log.Printf("✅ [handleSendMessage] сообщение id=%d создано", message.ID)

	var user models.User
	database.DB.First(&user, userID)

	payload := gin.H{
		"id":            message.ID,
		"chat_id":       message.ChatID,
		"user_id":       message.UserID,
		"username":      user.Username,
		"avatar":        user.Avatar,
		"content":       message.Content,
		"type":          message.Type,
		"reply_to_id":   message.ReplyToID,
		"client_msg_id": message.ClientMsgID,
		"is_edited":     false,
		"is_deleted":    false,
		"created_at":    message.CreatedAt,
	}

	log.Printf("📤 [handleSendMessage] broadcasting в room %d", msg.ChatID)
	hub.BroadcastToChat(msg.ChatID, ws.NewEvent("message:new", payload))
}

func handleTyping(hub *ws.Hub, userID, chatID uint, isTyping bool) {
	eventType := "typing:stop"
	if isTyping {
		eventType = "typing:start"
	}
	log.Printf("⌨️ [handleTyping] %s от userID=%d в chatID=%d", eventType, userID, chatID)
	hub.BroadcastToChat(chatID, ws.NewEvent(eventType, gin.H{
		"user_id": userID,
		"chat_id": chatID,
	}))
}

func handleReadMessage(hub *ws.Hub, userID, chatID uint) {
	log.Printf("👁 [handleReadMessage] userID=%d в chatID=%d", userID, chatID)
	database.DB.Model(&models.ChatMember{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Update("last_read_at", time.Now())
}

// ============== REST API ==============

func CreateOrGetChat(c *gin.Context) {
	currentUserID := c.GetUint("userID")

	var input struct {
		UserID uint `json:"user_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if input.UserID == currentUserID {
		c.JSON(400, gin.H{"error": "нельзя создать чат с собой"})
		return
	}

	var u1, u2 models.User
	if database.DB.First(&u1, currentUserID).Error != nil ||
		database.DB.First(&u2, input.UserID).Error != nil {
		c.JSON(404, gin.H{"error": "пользователь не найден"})
		return
	}

	var existingChat models.Chat
	err := database.DB.
		Joins("JOIN chat_members cm1 ON cm1.chat_id = chats.id AND cm1.user_id = ?", currentUserID).
		Joins("JOIN chat_members cm2 ON cm2.chat_id = chats.id AND cm2.user_id = ?", input.UserID).
		Where("chats.type = ?", "private").
		First(&existingChat).Error

	if err == nil {
		c.JSON(200, existingChat)
		return
	}

	chat := models.Chat{
		Type:      "private",
		CreatedBy: currentUserID,
	}
	database.DB.Create(&chat)

	database.DB.Create(&models.ChatMember{ChatID: chat.ID, UserID: currentUserID})
	database.DB.Create(&models.ChatMember{ChatID: chat.ID, UserID: input.UserID})

	c.JSON(200, chat)
}

func GetChats(c *gin.Context) {
	userID := c.GetUint("userID")

	var chats []models.Chat
	database.DB.
		Joins("JOIN chat_members ON chat_members.chat_id = chats.id").
		Where("chat_members.user_id = ?", userID).
		Order("chats.updated_at DESC").
		Find(&chats)

	result := []gin.H{}
	for _, chat := range chats {
		item := gin.H{
			"id":         chat.ID,
			"type":       chat.Type,
			"title":      chat.Title,
			"avatar":     chat.Avatar,
			"created_at": chat.CreatedAt,
			"updated_at": chat.UpdatedAt,
		}

		if chat.Type == "private" {
			var peer models.User
			database.DB.
				Joins("JOIN chat_members ON chat_members.user_id = users.id").
				Where("chat_members.chat_id = ? AND users.id != ?", chat.ID, userID).
				First(&peer)

			item["peer"] = gin.H{
				"id":        peer.ID,
				"username":  peer.Username,
				"avatar":    peer.Avatar,
				"bio":       peer.Bio,
				"last_seen": peer.LastSeen,
			}
		}

		result = append(result, item)
	}

	c.JSON(200, result)
}

func GetMessages(c *gin.Context) {
	userID := c.GetUint("userID")
	chatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var member models.ChatMember
	if err := database.DB.Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&member).Error; err != nil {
		c.JSON(403, gin.H{"error": "нет доступа"})
		return
	}

	var messages []models.Message
	database.DB.Where("chat_id = ?", chatID).
		Order("created_at ASC").
		Limit(100).
		Find(&messages)

	enriched := []gin.H{}
	for _, m := range messages {
		var u models.User
		database.DB.First(&u, m.UserID)

		enriched = append(enriched, gin.H{
			"id":            m.ID,
			"chat_id":       m.ChatID,
			"user_id":       m.UserID,
			"username":      u.Username,
			"avatar":        u.Avatar,
			"content":       m.Content,
			"type":          m.Type,
			"file_url":      m.FileURL,
			"reply_to_id":   m.ReplyToID,
			"client_msg_id": m.ClientMsgID,
			"is_edited":     m.IsEdited,
			"is_deleted":    m.IsDeleted,
			"created_at":    m.CreatedAt,
		})
	}

	c.JSON(200, enriched)
}

func SearchUsers(c *gin.Context) {
	currentUserID := c.GetUint("userID")
	q := c.Query("q")

	if len(q) < 1 {
		c.JSON(200, []gin.H{})
		return
	}

	var users []models.User
	database.DB.
		Where("(username ILIKE ? OR bio ILIKE ?) AND id != ?", "%"+q+"%", "%"+q+"%", currentUserID).
		Limit(20).
		Find(&users)

	result := []gin.H{}
	for _, u := range users {
		result = append(result, gin.H{
			"id":        u.ID,
			"username":  u.Username,
			"avatar":    u.Avatar,
			"bio":       u.Bio,
			"last_seen": u.LastSeen,
		})
	}

	c.JSON(200, result)
}

func GetUserByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "не найден"})
		return
	}

	c.JSON(200, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"avatar":     user.Avatar,
		"bio":        user.Bio,
		"role":       user.Role,
		"last_seen":  user.LastSeen,
		"created_at": user.CreatedAt,
	})
}

// GetUsersList — список всех пользователей для страницы "Знакомства"
// GET /api/users?role=frontend&limit=20&offset=0
func GetUsersList(c *gin.Context) {
	currentUserID := c.GetUint("userID")
	category := c.Query("category")
	limit := 20
	offset := 0

	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 && l <= 100 {
		limit = l
	}
	if o, err := strconv.Atoi(c.Query("offset")); err == nil && o >= 0 {
		offset = o
	}

	query := database.DB.Model(&models.User{}).
		Where("id != ?", currentUserID)

	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	var users []models.User
	query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&users)

	var total int64
	query.Count(&total)

	result := []gin.H{}
	for _, u := range users {
		result = append(result, gin.H{
			"id":        u.ID,
			"username":  u.Username,
			"avatar":    u.Avatar,
			"bio":       u.Bio,
			"role":      u.Role,
			"category":  u.Category,
			"last_seen": u.LastSeen,
		})
	}

	c.JSON(200, gin.H{
		"users": result,
		"total": total,
	})
}
