package models

// Message - структура сообщения
type Message struct {
	User string `json:"user"`
	Text string `json:"text"`
}