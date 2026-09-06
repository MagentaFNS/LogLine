package controllers

import (
	"net/http"
	"time"

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

		msg.CreatedAt = time.Now()
		database.DB.Create(&msg)

		for client := range clients {
			if err := client.WriteJSON(msg); err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}