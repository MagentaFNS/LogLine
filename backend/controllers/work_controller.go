package controllers

import (
	"github.com/gin-gonic/gin"

	"logline/database"
)

type Work struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Title    string `json:"title"`
	Company  string `json:"company"`
	Location string `json:"location"`
	Salary   string `json:"salary"`
}

func CreateWork(c *gin.Context) {
	var input Work
	c.ShouldBindJSON(&input)
	database.DB.Create(&input)
	c.JSON(200, input)
}

func GetWorks(c *gin.Context) {
	var works []Work
	database.DB.Find(&works)
	c.JSON(200, works)
}