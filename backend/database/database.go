package database

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"logline/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// Загружаем переменные из .env (файл лежит в корне проекта)
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal("❌ Не удалось загрузить файл .env (путь: ../.env)")
	}

	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := "host=" + host + " user=" + user + " password=" + pass + " dbname=" + name + " port=" + port + " sslmode=disable"
	var dbErr error
	DB, dbErr = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if dbErr != nil {
		log.Fatal("❌ Не удалось подключиться к PostgreSQL: ", dbErr)
	}

	err = DB.AutoMigrate(
		&models.User{}, 
		&models.Note{}, 
		&models.ChatMessage{}, 
		&models.Post{}, 
		&models.Notification{},
	)
	if err != nil {
		log.Fatal("❌ Ошибка миграции: ", err)
	}

	log.Println("✅ БД для LogLine подключена!")
}