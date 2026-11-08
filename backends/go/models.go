package main

import (
	"cmp"
	"maps"
	"slices"
	"time"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Key      string `json:"key"`
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

var currentId = 15

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

type UpdateReorderablePayload struct {
	Name         string `json:"name,omitempty"`
	DisplayOrder int    `json:"display_order,omitempty"`
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
				// If display order has increased, then `moved` goes after sibling with same order
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
	Items       []*Item     `json:"items"`
	BaseReorderable
}

// Map of users to their corresponding lists
var AppLists = map[User][]*FancyList{
	AppUsers["admin"]: {
		{
			Id:           1,
			Name:         "List 1",
			CreatedDate:  time.Now(),
			Owner:        AppUsers["admin"],
			Categories:   []*Category{},
			Items:        []*Item{},
			DisplayOrder: 10,
		},
		{
			Id:           2,
			Name:         "List 2",
			CreatedDate:  time.Now(),
			Owner:        AppUsers["admin"],
			Categories:   []*Category{},
			Items:        []*Item{},
			DisplayOrder: 20,
		},
		{
			Id:           3,
			Name:         "List 3",
			CreatedDate:  time.Now(),
			Owner:        AppUsers["admin"],
			Categories:   []*Category{},
			Items:        []*Item{},
			DisplayOrder: 30,
		},
	},
}

func GetUserList(user User, id int) *FancyList {
	for _, list := range AppLists[user] {
		if list.Id == id {
			// Populate all categories associated with the list
			list.Categories = GetListCategories(list)

			// Populate all items associated with the list
			listItems := slices.Collect(maps.Values(AllItems))
			if listItems == nil {
				listItems = []*Item{}
			}

			slices.SortFunc(listItems, func(a, b *Item) int {
				return cmp.Compare(a.GetDisplayOrder(), b.GetDisplayOrder())
			})

			list.Items = listItems
			return list
		}
	}

	return nil
}

func UpdateList(list *FancyList, payload UpdateReorderablePayload) {
	if payload.Name != "" {
		list.Name = payload.Name
	}

	if payload.DisplayOrder != list.DisplayOrder {
		AppLists[list.Owner] = MoveReorderable(AppLists[list.Owner], list.Id, payload.DisplayOrder)
	}
}

type Category struct {
	Name      string  `json:"name" validate:"required,max=100"`
	FancyList int     `json:"list" validate:"required"`
	Items     []*Item `json:"items"`
	BaseReorderable
}

// Map of category ID to its corresponding category
var AllCategories = map[int]*Category{
	4: {
		Id:           4,
		Name:         "Category 1",
		FancyList:    1,
		Items:        []*Item{},
		DisplayOrder: 10,
	},
	5: {
		Id:           5,
		Name:         "Category 2",
		FancyList:    1,
		Items:        []*Item{},
		DisplayOrder: 20,
	},
	6: {
		Id:           6,
		Name:         "Category 3",
		FancyList:    1,
		Items:        []*Item{},
		DisplayOrder: 30,
	},
}

// Map of list ID to its corresponding categories
var ListCategories = map[int][]*Category{
	1: {
		{
			Id:           4,
			Name:         "Category 1",
			FancyList:    1,
			Items:        []*Item{},
			DisplayOrder: 10,
		},
		{
			Id:           5,
			Name:         "Category 2",
			FancyList:    1,
			Items:        []*Item{},
			DisplayOrder: 20,
		},
		{
			Id:           6,
			Name:         "Category 3",
			FancyList:    1,
			Items:        []*Item{},
			DisplayOrder: 30,
		},
	},
}

func CreateCategory(name string, list *FancyList) *Category {
	category := &Category{
		Id:           NextId(),
		Name:         name,
		FancyList:    list.Id,
		Items:        []*Item{},
		DisplayOrder: (len(list.Categories) + 1) * 10,
	}
	AllCategories[category.Id] = category
	ListCategories[list.Id] = append(ListCategories[list.Id], category)
	return category
}

func UpdateCategory(category *Category, payload UpdateReorderablePayload) {
	if payload.Name != "" {
		category.Name = payload.Name
	}

	if payload.DisplayOrder != category.DisplayOrder {
		ListCategories[category.FancyList] = MoveReorderable(ListCategories[category.FancyList], category.Id, payload.DisplayOrder)
	}
}

func DeleteCategory(category *Category) {
	for _, item := range GetCategoryItems(category) {
		DeleteItem(item)
	}

	delete(AllCategories, category.Id)
	ListCategories[category.FancyList] = DeleteReorderable(ListCategories[category.FancyList], category.Id)
}

func GetListCategories(list *FancyList) []*Category {
	listCategories := ListCategories[list.Id]
	if listCategories == nil {
		return []*Category{}
	}

	for _, category := range listCategories {
		category.Items = GetCategoryItems(category)
	}

	return listCategories
}

type Item struct {
	Name     string `json:"name" validate:"required,max=100"`
	Category int    `json:"category" validate:"required"`
	BaseReorderable
}

// Map of item ID to its corresponding item
var AllItems = map[int]*Item{
	7: {
		Id:           7,
		Name:         "Item 1",
		Category:     4,
		DisplayOrder: 10,
	},
	8: {
		Id:           8,
		Name:         "Item 2",
		Category:     4,
		DisplayOrder: 20,
	},
	9: {
		Id:           9,
		Name:         "Item 3",
		Category:     4,
		DisplayOrder: 30,
	},
	10: {
		Id:           10,
		Name:         "Item 4",
		Category:     5,
		DisplayOrder: 10,
	},
	11: {
		Id:           11,
		Name:         "Item 5",
		Category:     5,
		DisplayOrder: 20,
	},
	12: {
		Id:           12,
		Name:         "Item 6",
		Category:     5,
		DisplayOrder: 30,
	},
	13: {
		Id:           10,
		Name:         "Item 7",
		Category:     6,
		DisplayOrder: 10,
	},
	14: {
		Id:           11,
		Name:         "Item 8",
		Category:     6,
		DisplayOrder: 20,
	},
	15: {
		Id:           12,
		Name:         "Item 9",
		Category:     6,
		DisplayOrder: 30,
	},
}

// Map of category ID to its corresponding items
var CategoryItems = map[int][]*Item{
	4: {
		{
			Id:           7,
			Name:         "Item 1",
			Category:     4,
			DisplayOrder: 10,
		},
		{
			Id:           8,
			Name:         "Item 2",
			Category:     4,
			DisplayOrder: 20,
		},
		{
			Id:           9,
			Name:         "Item 3",
			Category:     4,
			DisplayOrder: 30,
		},
	},
	5: {
		{
			Id:           10,
			Name:         "Item 4",
			Category:     5,
			DisplayOrder: 10,
		},
		{
			Id:           11,
			Name:         "Item 5",
			Category:     5,
			DisplayOrder: 20,
		},
		{
			Id:           12,
			Name:         "Item 6",
			Category:     5,
			DisplayOrder: 30,
		},
	},
	6: {
		{
			Id:           13,
			Name:         "Item 7",
			Category:     6,
			DisplayOrder: 10,
		},
		{
			Id:           14,
			Name:         "Item 8",
			Category:     6,
			DisplayOrder: 20,
		},
		{
			Id:           15,
			Name:         "Item 9",
			Category:     6,
			DisplayOrder: 30,
		},
	},
}

func CreateItem(name string, category *Category) *Item {
	categoryItems := GetCategoryItems(category)
	item := &Item{
		Id:           NextId(),
		Name:         name,
		Category:     category.Id,
		DisplayOrder: (len(categoryItems) + 1) * 10,
	}
	AllItems[item.Id] = item
	CategoryItems[category.Id] = append(CategoryItems[category.Id], item)
	return item
}

func UpdateItem(item *Item, payload UpdateReorderablePayload) {
	if payload.Name != "" {
		item.Name = payload.Name
	}

	if payload.DisplayOrder != item.DisplayOrder {
		CategoryItems[item.Category] = MoveReorderable(CategoryItems[item.Category], item.Id, payload.DisplayOrder)
	}
}

func DeleteItem(item *Item) {
	delete(AllItems, item.Id)
	CategoryItems[item.Category] = DeleteReorderable(CategoryItems[item.Category], item.Id)
}

func GetCategoryItems(category *Category) []*Item {
	categoryItems := CategoryItems[category.Id]
	if categoryItems == nil {
		return []*Item{}
	}

	return categoryItems
}
