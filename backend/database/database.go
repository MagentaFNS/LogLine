package database

import (
	"log"

	"logline/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error
	DB, err = gorm.Open(sqlite.Open("logline.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Не удалось подключиться к базе данных: ", err)
	}

	// Автоматическая миграция схемы
	err = DB.AutoMigrate(&models.User{}, &models.Note{}, &models.ChatMessage{})
	if err != nil {
		log.Fatal("Ошибка миграции: ", err)
	}
	
	log.Println("✅ База данных подключена")
}