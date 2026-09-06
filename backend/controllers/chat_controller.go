package controllers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"logline/database"
	"logline/models"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	clients[conn] = true

	for {
		var msg models.ChatMessage
		if err := conn.ReadJSON(&msg); err != nil {
			delete(clients, conn)
			return
		}
		
		database.DB.Create(&msg)

		for client := range clients {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func GetMessagesWithUser(c *gin.Context) {
	userID := c.GetUint("userID")
	otherUserID := c.Param("id")

	var messages []models.ChatMessage
	database.DB.Where(
		"(user_id = ? AND username = ?) OR (user_id = ? AND username = ?)",
		userID, otherUserID, otherUserID, userID,
	).Order("created_at asc").Find(&messages)

	c.JSON(200, messages)
}