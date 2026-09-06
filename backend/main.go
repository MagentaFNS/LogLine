package main

import (
	"log"

	"logline/database"
	"logline/routes"
)

func main() {
	// Подключаем базу данных
	database.Connect()

	// Настраиваем маршруты
	r := routes.SetupRouter()

	log.Println("🚀 LogLine Backend запущен на порту 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Ошибка запуска сервера: ", err)
	}
}