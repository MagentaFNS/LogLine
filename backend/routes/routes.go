package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"logline/controllers"
	"logline/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// НОВОЕ: Erlaube alle Ports! (Einfach machen)
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
		api.GET("/ws", controllers.HandleWebSocket)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/me", controllers.GetCurrentUser)
			
			protected.GET("/notes", controllers.GetNotes)
			protected.POST("/notes", controllers.CreateNote)
			protected.DELETE("/notes/:id", controllers.DeleteNote)
			protected.GET("/note-stats", controllers.GetNoteStats)

			protected.POST("/upload/avatar", controllers.UploadAvatar)

			protected.POST("/upload/post-image", controllers.UploadPostImage)

			protected.GET("/works", controllers.GetWorks)
			protected.POST("/works", controllers.CreateWork)
			protected.PUT("/works/:id", controllers.EditWork)
			protected.DELETE("/works/:id", controllers.DeleteWork)

			protected.GET("/posts", controllers.GetPosts)
			protected.POST("/posts", controllers.CreatePost)
			protected.POST("/posts/:id/like", controllers.LikePost)
			protected.POST("/posts/:id/unlike", controllers.UnlikePost)
			protected.DELETE("/posts/:id", controllers.DeletePost)

			protected.GET("/notifications", controllers.GetNotifications)
			protected.POST("/notifications/read-all", controllers.MarkAllNotificationsRead)

			protected.GET("/admin/users", controllers.GetUsers)
			protected.GET("/admin/stats", controllers.GetStats)

		}
	}

	return r
}