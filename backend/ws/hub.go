package ws

import (
	"encoding/json"
	"log"
	"sync"
)

// Hub — центральный узел WebSocket
type Hub struct {
	// userID → клиент (одно активное соединение)
	clients map[uint]*Client

	// chatID → множество клиентов в комнате
	rooms map[uint]map[*Client]bool

	// мутекс для защиты мап
	mu sync.RWMutex

	// каналы
	register   chan *Client
	unregister chan *Client
	incoming   chan IncomingPayload
	broadcast  chan BroadcastPayload

	// callbacks (передаются извне)
	OnMessage func(userID, chatID uint, raw []byte) // обработка входящего
	OnJoin    func(userID uint, chatIDs []uint)     // при подключении
	OnLeave   func(userID uint)                     // при отключении
}

// BroadcastPayload — сообщение для рассылки
type BroadcastPayload struct {
	ChatID uint
	Event  Event
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uint]*Client),
		rooms:      make(map[uint]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		incoming:   make(chan IncomingPayload),
		broadcast:  make(chan BroadcastPayload),
	}
}

// Run — основной цикл хаба
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("🟢 WS подключён: userID=%d", client.UserID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				// Убираем из всех комнат
				for _, room := range h.rooms {
					delete(room, client)
				}
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("🔴 WS отключён: userID=%d", client.UserID)
			if h.OnLeave != nil {
				h.OnLeave(client.UserID)
			}

		case payload := <-h.incoming:
			if h.OnMessage != nil {
				h.OnMessage(payload.Client.UserID, 0, payload.Raw)
			}

		case b := <-h.broadcast:
			h.mu.RLock()
			room, ok := h.rooms[b.ChatID]
			h.mu.RUnlock()
			if !ok {
				continue
			}
			data, _ := json.Marshal(b.Event)
			for client := range room {
				select {
				case client.Send <- data:
				default:
					close(client.Send)
					delete(room, client)
				}
			}
		}
	}
}

// Register — регистрирует клиента
func (h *Hub) Register(client *Client, chatIDs []uint) {
	h.mu.Lock()
	for _, cid := range chatIDs {
		if h.rooms[cid] == nil {
			h.rooms[cid] = make(map[*Client]bool)
		}
		h.rooms[cid][client] = true
	}
	h.mu.Unlock()
	h.register <- client

	if h.OnJoin != nil {
		h.OnJoin(client.UserID, chatIDs)
	}
}

// BroadcastToChat — рассылка в комнату
func (h *Hub) BroadcastToChat(chatID uint, event Event) {
	h.broadcast <- BroadcastPayload{ChatID: chatID, Event: event}
}

// SendToUser — личное сообщение одному пользователю
func (h *Hub) SendToUser(userID uint, event Event) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if !ok {
		return
	}
	data, _ := json.Marshal(event)
	select {
	case client.Send <- data:
	default:
	}
}

// IsOnline — проверка онлайн-статуса
func (h *Hub) IsOnline(userID uint) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.clients[userID]
	return ok
}

// OnlineUsers — список онлайн-пользователей
func (h *Hub) OnlineUsers() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()
	ids := make([]uint, 0, len(h.clients))
	for id := range h.clients {
		ids = append(ids, id)
	}
	return ids
}
