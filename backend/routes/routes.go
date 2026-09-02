package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"logline/controllers"
	"logline/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Настройка CORS для локальной разработки
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Публичные маршруты
	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		api.GET("/ws", controllers.HandleWebSocket)

		// Приватные маршруты (с авторизацией)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/notes", controllers.GetNotes)
			protected.POST("/notes", controllers.CreateNote)
			protected.DELETE("/notes/:id", controllers.DeleteNote)

			// Админ маршруты
			protected.GET("/admin/users", controllers.GetUsers)
			protected.GET("/admin/stats", controllers.GetStats)
		}
	}

	return r
}