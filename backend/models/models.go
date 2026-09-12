package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	Category  string    `json:"category"`
	Avatar    string    `json:"avatar" gorm:"default:'https://i.pravatar.cc/150'"`
	Bio       string    `json:"bio"`
	LastSeen  time.Time `json:"last_seen"`
	CreatedAt time.Time `json:"created_at"`
}

type Note struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	AuthorID  uint      `json:"author_id"`
	CreatedAt time.Time `json:"created_at"`
}

// ===== ЧАТЫ =====

type Chat struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Avatar    string    `json:"avatar"`
	CreatedBy uint      `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ChatMember struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	ChatID     uint      `json:"chat_id" gorm:"index:idx_chat_user,unique"`
	UserID     uint      `json:"user_id" gorm:"index:idx_chat_user,unique"`
	JoinedAt   time.Time `json:"joined_at"`
	LastReadAt time.Time `json:"last_read_at"`
}

type Message struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ChatID      uint      `json:"chat_id" gorm:"index"`
	UserID      uint      `json:"user_id" gorm:"index"`
	Content     string    `json:"content"`
	Type        string    `json:"type"`
	FileURL     string    `json:"file_url"`
	ReplyToID   *uint     `json:"reply_to_id,omitempty"`
	ClientMsgID string    `json:"client_msg_id" gorm:"index"`
	IsEdited    bool      `json:"is_edited" gorm:"default:false"`
	IsDeleted   bool      `json:"is_deleted" gorm:"default:false"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ===== ПОСТЫ / УВЕДОМЛЕНИЯ / РАБОТЫ =====

type Post struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Content   string    `json:"content"`
	AuthorID  uint      `json:"author_id"`
	Username  string    `json:"username"`
	Avatar    string    `json:"avatar"`
	Likes     int       `json:"likes"`
	Image     string    `json:"image"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at"`
}

type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	Text      string    `json:"text"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

type Work struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Company   string    `json:"company"`
	Location  string    `json:"location"`
	Salary    string    `json:"salary"`
	CreatedAt time.Time `json:"created_at"`
}
