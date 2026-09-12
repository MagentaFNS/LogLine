package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"logline/controllers"
	"logline/middleware"
	"logline/ws"
)

func SetupRouter(hub *ws.Hub) *gin.Engine {
	r := gin.Default()

	// WebSocket регистрируется ДО CORS, иначе CORS обрезает заголовки Upgrade
	r.GET("/api/ws", controllers.HandleWebSocket(hub))

	// CORS для остальных запросов
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowCredentials = false
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", controllers.GetCurrentUser)
			protected.GET("/profile/stats", controllers.GetProfileStats)
			protected.POST("/update-profile", controllers.UpdateProfile)
			protected.POST("/upload/avatar", controllers.UploadAvatar)
			protected.POST("/upload/post-image", controllers.UploadPostImage)

			protected.POST("/chats", controllers.CreateOrGetChat)
			protected.GET("/chats", controllers.GetChats)
			protected.GET("/chats/:id/messages", controllers.GetMessages)

			protected.GET("/users", controllers.GetUsersList)
			protected.GET("/users/search", controllers.SearchUsers)
			protected.GET("/users/:id", controllers.GetUserByID)

			protected.GET("/notes", controllers.GetNotes)
			protected.POST("/notes", controllers.CreateNote)
			protected.DELETE("/notes/:id", controllers.DeleteNote)
			protected.GET("/note-stats", controllers.GetNoteStats)

			protected.GET("/posts", controllers.GetPosts)
			protected.POST("/posts", controllers.CreatePost)
			protected.POST("/posts/:id/like", controllers.LikePost)
			protected.POST("/posts/:id/unlike", controllers.UnlikePost)
			protected.DELETE("/posts/:id", controllers.DeletePost)

			protected.GET("/works", controllers.GetWorks)
			protected.POST("/works", controllers.CreateWork)
			protected.PUT("/works/:id", controllers.EditWork)
			protected.DELETE("/works/:id", controllers.DeleteWork)

			protected.GET("/notifications", controllers.GetNotifications)
			protected.POST("/notifications/read-all", controllers.MarkAllNotificationsRead)

			protected.GET("/admin/users", controllers.GetUsers)
			protected.GET("/admin/stats", controllers.GetStats)
		}
	}

	return r
}
