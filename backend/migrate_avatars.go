//go:build ignore
// +build ignore

package main

import (
	"fmt"
	"strings"

	"logline/database"
	"logline/models"
)

func main() {
	database.Connect()

	var users []models.User
	database.DB.Find(&users)

	updated := 0
	for _, u := range users {
		if strings.HasPrefix(u.Avatar, "http") {
			parts := strings.Split(u.Avatar, "/uploads/")
			if len(parts) == 2 {
				u.Avatar = parts[1]
				database.DB.Save(&u)
				fmt.Printf("✅ User %s → %s\n", u.Username, u.Avatar)
				updated++
			}
		}
	}

	var posts []models.Post
	database.DB.Find(&posts)
	for _, p := range posts {
		if strings.HasPrefix(p.Avatar, "http") {
			parts := strings.Split(p.Avatar, "/uploads/")
			if len(parts) == 2 {
				p.Avatar = parts[1]
				database.DB.Save(&p)
				updated++
			}
		}
	}

	fmt.Printf("\n🎉 Обновлено записей: %d\n", updated)
}
