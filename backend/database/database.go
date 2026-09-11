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
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatal("❌ Не удалось загрузить файл .env (путь: ../.env)")
	}

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=disable"

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Не удалось подключиться к PostgreSQL: ", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.Note{},
		&models.Chat{},
		&models.ChatMember{},
		&models.Message{},
		&models.Post{},
		&models.Notification{},
		&models.Work{},
	)
	if err != nil {
		log.Fatal("❌ Ошибка миграции: ", err)
	}

	log.Println("✅ БД для LogLine подключена!")
}
