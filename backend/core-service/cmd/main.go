package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/MagentaFNS/LogLine/backend/core-service/internal/handlers"
	"github.com/MagentaFNS/LogLine/backend/core-service/internal/service"
)

func main() {
	// 1. Создаем сервис (хранилище)
	store := service.NewStorage()

	// 2. Создаем Hub для WebSocket
	hub := handlers.NewHub(store)
	go hub.Run()

	// 3. Подключаем маршруты
	http.HandleFunc("/api/messages", handlers.GetMessagesAPI(store))
	http.HandleFunc("/ws", hub.ServeWs)

	// 4. Запускаем сервер
	addr := ":8000"
	fmt.Println("Сервер запущен на http://localhost" + addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}