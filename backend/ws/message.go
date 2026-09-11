package ws

import "encoding/json"

// Event — событие в WebSocket
type Event struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

// Пакет для отправки события
func NewEvent(t string, data interface{}) Event {
	raw, _ := json.Marshal(data)
	return Event{Type: t, Data: raw}
}

// Входящее сообщение от клиента
type IncomingMessage struct {
	Type        string `json:"type"`          // "message:send", "typing:start", ...
	ChatID      uint   `json:"chat_id"`
	Content     string `json:"content"`
	ReplyToID   *uint  `json:"reply_to_id,omitempty"`
	ClientMsgID string `json:"client_msg_id"`
}
