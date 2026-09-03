package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"logline/controllers"
	"logline/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"}
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
			protected.GET("/notes", controllers.GetNotes)
			protected.POST("/notes", controllers.CreateNote)
			protected.DELETE("/notes/:id", controllers.DeleteNote)
			protected.GET("/note-stats", controllers.GetNoteStats)

			protected.POST("/upload/avatar", controllers.UploadAvatar)
			protected.POST("/update-profile", controllers.UpdateProfile)

			protected.POST("/works", controllers.CreateWork)
			protected.GET("/works", controllers.GetWorks)

			protected.GET("/posts", controllers.GetPosts)
			protected.POST("/posts", controllers.CreatePost)
			protected.POST("/posts/:id/like", controllers.LikePost)

			protected.GET("/admin/users", controllers.GetUsers)
			protected.GET("/admin/stats", controllers.GetStats)
		}
	}

	return r
}