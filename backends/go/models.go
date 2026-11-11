package main

import (
	"encoding/json"
	"time"
)

type User struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Key      string `json:"key"`
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

type UpdateReorderablePayload struct {
	Name         string `json:"name,omitempty"`
	DisplayOrder int    `json:"display_order,omitempty"`
}

func UpdateReorderable[T Reorderable](reorderable T, payload UpdateReorderablePayload) {
	data, _ := json.Marshal(payload)
	json.Unmarshal(data, &reorderable)
}

type FancyList struct {
	Name        string      `json:"name" validate:"required,max=100"`
	CreatedDate time.Time   `json:"created_date" validate:"required"`
	Owner       string      `json:"owner" validate:"required"`
	Categories  []*Category `json:"categories"`
	Items       []*Item     `json:"items"`
	BaseReorderable
}

type Category struct {
	Name      string  `json:"name" validate:"required,max=100"`
	FancyList int     `json:"list" validate:"required"`
	Items     []*Item `json:"items"`
	BaseReorderable
}

func UpdateCategory(category *Category, payload UpdateReorderablePayload) {
	if payload.Name != "" {
		category.Name = payload.Name
	}

	// if payload.DisplayOrder != category.DisplayOrder {
	// 	ListCategories[category.FancyList] = MoveReorderable(ListCategories[category.FancyList], category.Id, payload.DisplayOrder)
	// }
}

type Item struct {
	Name     string `json:"name" validate:"required,max=100"`
	Category int    `json:"category" validate:"required"`
	BaseReorderable
}

type UpdateItemPayload struct {
	Name         string `json:"name,omitempty"`
	Category     int    `json:"category,omitempty"`
	DisplayOrder int    `json:"display_order,omitempty"`
}

func UpdateItem(item *Item, payload UpdateItemPayload) {
	if payload.Name != "" {
		item.Name = payload.Name
	}

	// if payload.DisplayOrder != item.DisplayOrder {
	// 	CategoryItems[item.Category] = MoveReorderable(CategoryItems[item.Category], item.Id, payload.DisplayOrder)
	// }
}
