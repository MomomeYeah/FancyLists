package main

import (
	"cmp"
	"encoding/json"
	"slices"
	"time"

	"github.com/google/uuid"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Key      string `json:"key1"`
}

// Hard code users for now
var AppUsers = map[string]User{
	"admin": {
		Username: "admin",
		Password: "password",
		Key:      "abcdefgh123456",
	},
	"admin2": {
		Username: "admin2",
		Password: "password2",
		Key:      "zyxwvuts123456",
	},
}

func GetUserByKey(key string) *User {
	for _, user := range AppUsers {
		if user.Key == key {
			return &user
		}
	}

	return nil
}

type Reorderable interface {
	GetId() uuid.UUID
	GetDisplayOrder() int
	SetDisplayOrder(order int)
}
type BaseReorderable struct {
	Id           uuid.UUID `json:"id"`
	DisplayOrder int       `json:"display_order" validate:"required"`
}

func (b *BaseReorderable) GetId() uuid.UUID { return b.Id }

func (b *BaseReorderable) GetDisplayOrder() int      { return b.DisplayOrder }
func (b *BaseReorderable) SetDisplayOrder(order int) { b.DisplayOrder = order }

func GetUserReorderable[T Reorderable](reorderables map[User][]T, user User, id uuid.UUID) *T {
	userReorderables := reorderables[user]
	for _, item := range userReorderables {
		if item.GetId() == id {
			return &item
		}
	}

	return nil
}

func UpdateReorderable[T Reorderable](item *T, other any) {
	data, _ := json.Marshal(other)
	json.Unmarshal(data, item)
}

func MoveReorderable[T Reorderable](list []T, id uuid.UUID, displayOrder int) []T {
	// Translate display order to be 10-based
	newDisplayOrder := (displayOrder + 1) * 10

	// Update the display order of the affected item
	var filteredList []T
	for _, item := range list {
		if item.GetId() == id {
			if item.GetDisplayOrder() > newDisplayOrder {
				// If display order has decreased, then `moved` goes before sibling with same order
				item.SetDisplayOrder(newDisplayOrder - 5)
			} else {
				// If display order has decreased, then `moved` goes before sibling with same order
				item.SetDisplayOrder(newDisplayOrder + 5)
			}
		}
		filteredList = append(filteredList, item)
	}

	// Re-sort the list
	slices.SortFunc(filteredList, func(a, b T) int {
		return cmp.Compare(a.GetDisplayOrder(), b.GetDisplayOrder())
	})

	for i := range filteredList {
		filteredList[i].SetDisplayOrder((i + 1) * 10)
	}

	return filteredList
}

func DeleteReorderable[T Reorderable](list []T, id uuid.UUID) []T {
	var filteredList []T
	nextDisplayOrder := 10
	for _, item := range list {
		if item.GetId() != id {
			item.SetDisplayOrder(nextDisplayOrder)
			filteredList = append(filteredList, item)
			nextDisplayOrder += 10
		}
	}

	return filteredList
}

type FancyList struct {
	Name        string    `json:"name" validate:"required,max=100"`
	CreatedDate time.Time `json:"created_date" validate:"required"`
	// TODO: FK
	Owner User `json:"owner" validate:"required"`
	BaseReorderable
}

var AppLists = map[User][]*FancyList{}

type Category struct {
	Name string `json:"name" validate:"required,max=100"`
	// TODO: FK
	FancyList FancyList `json:"list" validate:"required"`
	BaseReorderable
}

var AppCategories = map[User][]*Category{}

type Item struct {
	Name string `json:"name" validate:"required,max=100"`
	// TODO: FK
	Category Category `json:"category" validate:"required"`
	BaseReorderable
}

var AppItems = map[User][]*Item{}
