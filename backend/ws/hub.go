package ws

import (
	"encoding/json"
	"log"
	"sync"
)

type Hub struct {
	clients map[uint]*Client
	rooms   map[uint]map[*Client]bool
	mu      sync.RWMutex

	register   chan *Client
	unregister chan *Client
	incoming   chan IncomingPayload
	broadcast  chan BroadcastPayload

	OnMessage func(userID, chatID uint, raw []byte)
	OnJoin    func(userID uint, chatIDs []uint)
	OnLeave   func(userID uint)
}

type BroadcastPayload struct {
	ChatID uint
	Event  Event
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uint]*Client),
		rooms:      make(map[uint]map[*Client]bool),
		register:   make(chan *Client, 10),
		unregister: make(chan *Client, 10),
		incoming:   make(chan IncomingPayload, 100),
		broadcast:  make(chan BroadcastPayload, 100),
	}
}

// safeClose — безопасно закрывает канал (без паники)
func safeClose(ch chan []byte) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("⚠️ [Hub] safeClose recover: %v", r)
		}
	}()
	close(ch)
}

func (h *Hub) Run() {
	log.Println("🟢 [Hub] запущен")
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("🟢 [Hub] подключён userID=%d, всего: %d", client.UserID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			_, exists := h.clients[client.UserID]
			if exists {
				delete(h.clients, client.UserID)
				for _, room := range h.rooms {
					delete(room, client)
				}
			}
			h.mu.Unlock()

			if exists {
				safeClose(client.Send)
				log.Printf("🔴 [Hub] отключён userID=%d", client.UserID)
				if h.OnLeave != nil {
					h.OnLeave(client.UserID)
				}
			}

		case payload := <-h.incoming:
			log.Printf("📨 [Hub] incoming от userID=%d: %s", payload.Client.UserID, string(payload.Raw))
			if h.OnMessage != nil {
				go h.OnMessage(payload.Client.UserID, 0, payload.Raw)
			}

		case b := <-h.broadcast:
			h.mu.RLock()
			room, ok := h.rooms[b.ChatID]
			count := len(room)
			h.mu.RUnlock()

			log.Printf("📢 [Hub] broadcast в room %d (клиентов: %d)", b.ChatID, count)

			if !ok || count == 0 {
				log.Printf("⚠️ [Hub] room %d пустая", b.ChatID)
				continue
			}

			data, err := json.Marshal(b.Event)
			if err != nil {
				log.Printf("❌ [Hub] marshal error: %v", err)
				continue
			}

			h.mu.RLock()
			for client := range room {
				select {
				case client.Send <- data:
					log.Printf("✅ [Hub] отправлено userID=%d", client.UserID)
				default:
					log.Printf("⚠️ [Hub] канал userID=%d переполнен", client.UserID)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Register(client *Client, chatIDs []uint) {
	h.mu.Lock()
	for _, cid := range chatIDs {
		if h.rooms[cid] == nil {
			h.rooms[cid] = make(map[*Client]bool)
		}
		h.rooms[cid][client] = true
		log.Printf("🟢 [Hub] userID=%d подписан на room %d", client.UserID, cid)
	}
	h.mu.Unlock()
	h.register <- client
}

func (h *Hub) BroadcastToChat(chatID uint, event Event) {
	h.broadcast <- BroadcastPayload{ChatID: chatID, Event: event}
}

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

func (h *Hub) IsOnline(userID uint) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.clients[userID]
	return ok
}

func (h *Hub) OnlineUsers() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()
	ids := make([]uint, 0, len(h.clients))
	for id := range h.clients {
		ids = append(ids, id)
	}
	return ids
}
