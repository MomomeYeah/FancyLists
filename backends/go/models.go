package main

import (
	"cmp"
	"encoding/json"
	"slices"
	"time"
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

var currentId = 1

func NextId() int {
	currentId += 1
	return currentId
}

type Reorderable interface {
	GetId() int
	GetDisplayOrder() int
	SetDisplayOrder(order int)
}
type BaseReorderable struct {
	Id           int `json:"id"`
	DisplayOrder int `json:"display_order" validate:"required"`
}

func (b *BaseReorderable) GetId() int { return b.Id }

func (b *BaseReorderable) GetDisplayOrder() int      { return b.DisplayOrder }
func (b *BaseReorderable) SetDisplayOrder(order int) { b.DisplayOrder = order }

func GetUserReorderable[T Reorderable](reorderables map[User][]T, user User, id int) *T {
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

func MoveReorderable[T Reorderable](list []T, id int, displayOrder int) []T {
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

func DeleteReorderable[T Reorderable](list []T, id int) []T {
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
	Name        string      `json:"name" validate:"required,max=100"`
	CreatedDate time.Time   `json:"created_date" validate:"required"`
	Owner       User        `json:"owner" validate:"required"`
	Categories  []*Category `json:"categories"`
	BaseReorderable
}

// var Lists = map[int]*FancyList{}
var AppLists = map[User][]*FancyList{}

func GetUserList(user User, id int) *FancyList {
	for _, list := range AppLists[user] {
		if list.Id == id {
			categories := []*Category{}
			for _, category := range GetListCategories(list) {
				categories = append(categories, GetCategory(category))
			}

			list.Categories = categories
			return list
		}
	}

	return nil
}

type Category struct {
	Name      string    `json:"name" validate:"required,max=100"`
	FancyList FancyList `json:"list" validate:"required"`
	Items     []*Item   `json:"items"`
	BaseReorderable
}

// Map of list ID to its corresponding categories
var ListCategories = map[int][]*Category{}

func GetCategory(category *Category) *Category {
	category.Items = GetCategoryItems(category)
	return category
}

func GetListCategories(list *FancyList) []*Category {
	listCategories := ListCategories[list.Id]
	if listCategories == nil {
		return []*Category{}
	}

	return listCategories
}

type Item struct {
	Name     string   `json:"name" validate:"required,max=100"`
	Category Category `json:"category" validate:"required"`
	BaseReorderable
}

// Map of category ID to its corresponding items
var CategoryItems = map[int][]*Item{}

func GetCategoryItems(category *Category) []*Item {
	categoryItems := CategoryItems[category.Id]
	if categoryItems == nil {
		return []*Item{}
	}

	return categoryItems
}
