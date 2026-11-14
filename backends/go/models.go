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

type UpdateReorderablePayload interface {
	GetDisplayOrder() int
	SetDisplayOrder(order int)
}
type BaseReorderablePayload struct {
	Name         string `json:"name,omitempty"`
	DisplayOrder int    `json:"display_order,omitempty"`
}

func (b *BaseReorderablePayload) GetDisplayOrder() int      { return b.DisplayOrder }
func (b *BaseReorderablePayload) SetDisplayOrder(order int) { b.DisplayOrder = order }

type UpdateItemPayload struct {
	Category int `json:"category,omitempty"`
	BaseReorderablePayload
}

func UpdateReorderable[T Reorderable, S UpdateReorderablePayload](reorderable T, payload S) {
	data, _ := json.Marshal(payload)
	json.Unmarshal(data, &reorderable)
}

type FancyList struct {
	Name        string      `json:"name" validate:"required,max=100"`
	CreatedDate time.Time   `json:"created_date" validate:"required"`
	Owner       int         `json:"owner" validate:"required"`
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

type Item struct {
	Name     string `json:"name" validate:"required,max=100"`
	Category int    `json:"category" validate:"required"`
	BaseReorderable
}
