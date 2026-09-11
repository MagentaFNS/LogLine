package main

import (
	"log"

	"logline/controllers"
	"logline/database"
	"logline/routes"
	"logline/ws"
)

func main() {
	// 1. Подключаем БД
	database.Connect()

	// 2. Создаём хаб
	hub := ws.NewHub()

	// 3. Запускаем хаб в фоне
	go hub.Run()

	// 4. Подключаем обработчики событий
	controllers.SetupHubCallbacks(hub)

	// 5. Настраиваем роуты (передаём хаб)
	r := routes.SetupRouter(hub)

	log.Println("🚀 LogLine Backend запущен на порту 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}
