package service

import (
	"sync"

	"github.com/MagentaFNS/LogLine/backend/core-service/internal/models"
)

// Storage - хранилище сообщений
type Storage struct {
	mu       sync.RWMutex
	messages []models.Message
}

func NewStorage() *Storage {
	return &Storage{}
}

func (s *Storage) AddMessage(msg models.Message) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.messages = append(s.messages, msg)
}

func (s *Storage) GetMessages() []models.Message {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.messages
}