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

// HandleWebSocket — точка входа для WS
// Подключение: ws://host/api/ws?token=JWT
func HandleWebSocket(hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Проверяем токен
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

		// 2. Апгрейдим соединение
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WS upgrade error: %v", err)
			return
		}

		// 3. Создаём клиента
		client := &ws.Client{
			Hub:    hub,
			Conn:   conn,
			Send:   make(chan []byte, 256),
			UserID: userID,
		}

		// 4. Получаем список чатов пользователя
		var chatIDs []uint
		database.DB.Model(&models.ChatMember{}).
			Where("user_id = ?", userID).
			Pluck("chat_id", &chatIDs)

		// 5. Регистрируем в хабе (добавляет в комнаты)
		hub.Register(client, chatIDs)

		// 6. Обновляем LastSeen
		database.DB.Model(&models.User{}).
			Where("id = ?", userID).
			Update("last_seen", time.Now())

		// 7. Уведомляем всех "presence:online"
		hub.BroadcastToChat(0, ws.NewEvent("presence:online", gin.H{
			"user_id": userID,
		}))

		// 8. Запускаем горутины
		go client.WritePump()
		client.ReadPump() // блокирующий вызов

		// 9. При отключении — обновляем LastSeen
		database.DB.Model(&models.User{}).
			Where("id = ?", userID).
			Update("last_seen", time.Now())

		hub.BroadcastToChat(0, ws.NewEvent("presence:offline", gin.H{
			"user_id":  userID,
			"last_seen": time.Now(),
		}))
	}
}

// ============== HANDLE INCOMING EVENTS ==============

// SetupHubCallbacks — подключаем обработчики событий из хаба
func SetupHubCallbacks(hub *ws.Hub) {
	hub.OnMessage = func(userID, _ uint, raw []byte) {
		var msg ws.IncomingMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Printf("WS unmarshal error: %v", err)
			return
		}

		switch msg.Type {
		case "message:send":
			handleSendMessage(hub, userID, msg)
		case "typing:start":
			handleTyping(hub, userID, msg.ChatID, true)
		case "typing:stop":
			handleTyping(hub, userID, msg.ChatID, false)
		case "message:read":
			handleReadMessage(hub, userID, msg.ChatID)
		}
	}
}

func handleSendMessage(hub *ws.Hub, userID uint, msg ws.IncomingMessage) {
	if msg.ChatID == 0 || msg.Content == "" {
		return
	}

	// Проверяем, что пользователь — участник чата
	var member models.ChatMember
	if err := database.DB.Where("chat_id = ? AND user_id = ?", msg.ChatID, userID).
		First(&member).Error; err != nil {
		return
	}

	// Создаём сообщение
	message := models.Message{
		ChatID:      msg.ChatID,
		UserID:      userID,
		Content:     msg.Content,
		Type:        "text",
		ReplyToID:   msg.ReplyToID,
		ClientMsgID: msg.ClientMsgID,
	}
	database.DB.Create(&message)

	// Загружаем данные пользователя
	var user models.User
	database.DB.First(&user, userID)

	// Формируем ответ
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

	// Рассылаем всем в комнате
	hub.BroadcastToChat(msg.ChatID, ws.NewEvent("message:new", payload))
}

func handleTyping(hub *ws.Hub, userID, chatID uint, isTyping bool) {
	eventType := "typing:stop"
	if isTyping {
		eventType = "typing:start"
	}
	hub.BroadcastToChat(chatID, ws.NewEvent(eventType, gin.H{
		"user_id": userID,
		"chat_id": chatID,
	}))
}

func handleReadMessage(hub *ws.Hub, userID, chatID uint) {
	database.DB.Model(&models.ChatMember{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Update("last_read_at", time.Now())

	hub.BroadcastToChat(chatID, ws.NewEvent("message:read", gin.H{
		"user_id": userID,
		"chat_id": chatID,
		"read_at": time.Now(),
	}))
}

// ============== REST API ==============

// CreateOrGetChat — создать или получить личный чат с пользователем
// POST /api/chats { "user_id": 2 }
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

	// Проверяем, что оба пользователя существуют
	var u1, u2 models.User
	if database.DB.First(&u1, currentUserID).Error != nil ||
		database.DB.First(&u2, input.UserID).Error != nil {
		c.JSON(404, gin.H{"error": "пользователь не найден"})
		return
	}

	// Ищем существующий личный чат
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

	// Создаём новый чат
	chat := models.Chat{
		Type:      "private",
		CreatedBy: currentUserID,
	}
	database.DB.Create(&chat)

	// Добавляем участников
	database.DB.Create(&models.ChatMember{ChatID: chat.ID, UserID: currentUserID})
	database.DB.Create(&models.ChatMember{ChatID: chat.ID, UserID: input.UserID})

	c.JSON(200, chat)
}

// GetChats — список моих чатов
// GET /api/chats
func GetChats(c *gin.Context) {
	userID := c.GetUint("userID")

	var chats []models.Chat
	database.DB.
		Joins("JOIN chat_members ON chat_members.chat_id = chats.id").
		Where("chat_members.user_id = ?", userID).
		Order("chats.updated_at DESC").
		Find(&chats)

	// Для каждого чата добавляем данные собеседника
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

		// Для личного чата — берём собеседника
		if chat.Type == "private" {
			var peer models.User
			database.DB.
				Joins("JOIN chat_members ON chat_members.user_id = users.id").
				Where("chat_members.chat_id = ? AND users.id != ?", chat.ID, userID).
				First(&peer)

			item["peer"] = gin.H{
				"id":       peer.ID,
				"username": peer.Username,
				"avatar":   peer.Avatar,
				"last_seen": peer.LastSeen,
			}
		}

		result = append(result, item)
	}

	c.JSON(200, result)
}

// GetMessages — история сообщений чата
// GET /api/chats/:id/messages?limit=50&before=123
func GetMessages(c *gin.Context) {
	userID := c.GetUint("userID")
	chatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	// Проверяем, что пользователь — участник чата
	var member models.ChatMember
	if err := database.DB.Where("chat_id = ? AND user_id = ?", chatID, userID).
		First(&member).Error; err != nil {
		c.JSON(403, gin.H{"error": "нет доступа"})
		return
	}

	var messages []models.Message
	query := database.DB.Where("chat_id = ?", chatID).
		Order("created_at DESC").
		Limit(100)

	if before := c.Query("before"); before != "" {
		if beforeID, err := strconv.ParseUint(before, 10, 64); err == nil {
			query = query.Where("id < ?", beforeID)
		}
	}

	query.Find(&messages)

	// Обогащаем данными пользователей
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

	// Разворачиваем (старые сверху)
	for i, j := 0, len(enriched)-1; i < j; i, j = i+1, j-1 {
		enriched[i], enriched[j] = enriched[j], enriched[i]
	}

	c.JSON(200, enriched)
}

// SearchUsers — поиск пользователей по username
// GET /api/users/search?q=mag
func SearchUsers(c *gin.Context) {
	currentUserID := c.GetUint("userID")
	q := c.Query("q")

	if len(q) < 1 {
		c.JSON(200, []gin.H{})
		return
	}

	var users []models.User
	database.DB.
		Where("username ILIKE ? AND id != ?", "%"+q+"%", currentUserID).
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

// GetUserByID — публичный профиль пользователя
// GET /api/users/:id
func GetUserByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "не найден"})
		return
	}

	c.JSON(200, gin.H{
		"id":        user.ID,
		"username":  user.Username,
		"avatar":    user.Avatar,
		"bio":       user.Bio,
		"role":      user.Role,
		"last_seen": user.LastSeen,
		"created_at": user.CreatedAt,
	})
}
