package main

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

func dropTables() string {
	return `
	DROP TABLE IF EXISTS items;
	DROP TABLE IF EXISTS categories;
	DROP TABLE IF EXISTS fancylists;
	DROP TABLE IF EXISTS users;
	`
}

func createTables() string {
	return `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		password TEXT,
		key TEXT
	);

	CREATE TABLE IF NOT EXISTS fancylists (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		created_date DATE,
		owner INTEGER REFERENCES users (id) ON DELETE CASCADE,
		display_order INTEGER
	);

	CREATE TABLE IF NOT EXISTS categories (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		fancylist INTEGER REFERENCES fancylists (id) ON DELETE CASCADE,
		display_order INTEGER
	);

	CREATE TABLE IF NOT EXISTS items (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		category INTEGER REFERENCES categories (id) ON DELETE CASCADE,
		display_order INTEGER
	);
	`
}

func seedDb(db *sql.DB) {
	// User admin
	_, err := db.Exec(`
	INSERT INTO users (username, password, key)
	VALUES
		('admin', 'password', 'OFV2OLB5CSXHUFAHG6EYVK5FOT'),
		('admin1', 'password', 'HGI5JEEKXMV4FTQLJERU45JBO4')`)
	if err != nil {
		log.Fatal(err)
	}

	// Lists
	_, err = db.Exec(`
	INSERT INTO fancylists (name, created_date, owner, display_order)
	VALUES
		('List 1!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 10),
		('List 2!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 20),
		('List 3!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 30),
		('List 4!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 40),
		('List 5!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 50),
		('List 6!', datetime('now'), (SELECT id FROM users WHERE username = 'admin'), 60)`)
	if err != nil {
		log.Fatal(err)
	}

	// Categories
	_, err = db.Exec(`
	INSERT INTO categories (name, fancylist, display_order)
	VALUES
		('Category 1!', (SELECT id FROM fancylists WHERE name = 'List 1!'), 10),
		('Category 2!', (SELECT id FROM fancylists WHERE name = 'List 1!'), 20),
		('Category 3!', (SELECT id FROM fancylists WHERE name = 'List 1!'), 30)`)
	if err != nil {
		log.Fatal(err)
	}

	// Items
	_, err = db.Exec(`
	INSERT INTO items (name, category, display_order)
	VALUES
		('Item 1!', (SELECT id FROM categories WHERE name = 'Category 1!'), 10),
		('Item 2!', (SELECT id FROM categories WHERE name = 'Category 1!'), 20),
		('Item 3!', (SELECT id FROM categories WHERE name = 'Category 1!'), 30),

		('Item 4!', (SELECT id FROM categories WHERE name = 'Category 2!'), 10),
		('Item 5!', (SELECT id FROM categories WHERE name = 'Category 2!'), 20),
		('Item 6!', (SELECT id FROM categories WHERE name = 'Category 2!'), 30),

		('Item 7!', (SELECT id FROM categories WHERE name = 'Category 3!'), 10),
		('Item 8!', (SELECT id FROM categories WHERE name = 'Category 3!'), 20),
		('Item 9!', (SELECT id FROM categories WHERE name = 'Category 3!'), 30)`)
	if err != nil {
		log.Fatal(err)
	}
}

// TODO: save DB as a global variable maybe?
func InitDb() *sql.DB {
	db, err := sql.Open("sqlite", "./fancylists.db")
	if err != nil {
		log.Fatal(err)
	}

	// Enable foreign key constraints
	_, err = db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Fatal(err)
	}

	// Drop all tables
	_, err = db.Exec(dropTables())
	if err != nil {
		log.Fatal(err)
	}

	// Create tables
	_, err = db.Exec(createTables())
	if err != nil {
		log.Fatal(err)
	}

	seedDb(db)

	return db
}

func CloseDb(db *sql.DB) {
	db.Close()
}

func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	row := db.QueryRow("SELECT id, username, password, key FROM users WHERE username = ?", username)
	user := User{}

	err := row.Scan(&user.Id, &user.Username, &user.Password, &user.Key)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func GetUserByKey(db *sql.DB, key string) (*User, error) {
	row := db.QueryRow("SELECT id, username, password, key FROM users WHERE key = ?", key)
	user := User{}

	err := row.Scan(&user.Id, &user.Username, &user.Password, &user.Key)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func CreateUser(db *sql.DB, username string, password string) (*User, error) {
	key := rand.Text()
	result, err := db.Exec("INSERT INTO users (username, password, key) VALUES (?, ?, ?)", username, password, key)
	if err != nil {
		log.Fatal(err)
	}

	lastInsertId, err := result.LastInsertId()
	if err != nil {
		log.Fatal(err)
	}

	user := User{
		Id:       int(lastInsertId),
		Username: username,
		Password: password,
		Key:      key,
	}

	return &user, nil
}

func GetUserList(db *sql.DB, user User, id int) (*FancyList, error) {
	row := db.QueryRow(`
	SELECT f.id, f.name, f.created_date, f.owner, f.display_order
	FROM fancylists f
	WHERE f.id = ?
	AND f.owner = ?`,
		id, user.Id)

	list := FancyList{}

	err := row.Scan(&list.Id, &list.Name, &list.CreatedDate, &list.Owner, &list.DisplayOrder)
	if err != nil {
		return nil, err
	}

	// TODO: N + 1 problem
	listCategories, err := GetListCategories(db, list.Id)
	if err != nil {
		return nil, err
	}
	list.Categories = listCategories

	listItems, err := GetListItems(db, list.Id)
	if err != nil {
		return nil, err
	}
	list.Items = listItems

	return &list, nil
}

func GetUserLists(db *sql.DB, user User) ([]*FancyList, error) {
	rows, err := db.Query(`
	SELECT f.id, f.name, f.created_date, f.owner, f.display_order
	FROM fancylists f
	WHERE f.owner = ?
	ORDER BY f.display_order ASC`,
		user.Id)
	if err != nil {
		return nil, err
	}

	lists := []*FancyList{}
	for rows.Next() {
		list := FancyList{}
		err := rows.Scan(&list.Id, &list.Name, &list.CreatedDate, &list.Owner, &list.DisplayOrder)
		if err != nil {
			log.Fatal(err)
		}

		lists = append(lists, &list)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return lists, nil
}

func GetListById(db *sql.DB, id int) (*FancyList, error) {
	row := db.QueryRow(`
	SELECT f.id, f.name, f.created_date, f.owner, f.display_order
	FROM fancylists f
	WHERE f.id = ?`,
		id)
	list := FancyList{}

	err := row.Scan(&list.Id, &list.Name, &list.CreatedDate, &list.Owner, &list.DisplayOrder)
	if err != nil {
		return nil, err
	}

	return &list, nil
}

func CreateList(db *sql.DB, name string, owner User) (*FancyList, error) {
	created_date := time.Now()
	result, err := db.Exec(`
	INSERT INTO fancylists (name, created_date, owner, display_order)
	VALUES (?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 10 FROM fancylists WHERE owner = ?))`,
		name, created_date, owner.Id, owner.Id)
	if err != nil {
		log.Fatal(err)
	}

	lastInsertId, err := result.LastInsertId()
	if err != nil {
		log.Fatal("CreateList: lastInsertId: ", err)
	}

	list, err := GetListById(db, int(lastInsertId))
	if err != nil {
		log.Fatal("CreateList: GetListById: ", err)
	}

	return list, nil
}

func ReorderReorderable[T Reorderable, S UpdateReorderablePayload](db *sql.DB, reorderable T, payload S, tableName string, corellationField string, corellationValue int) {
	// Normalise display order
	payload.SetDisplayOrder((payload.GetDisplayOrder() + 1) * 10)

	// If display order has increased, then item appears after its sibling with the same display order
	if payload.GetDisplayOrder() > reorderable.GetDisplayOrder() {
		_, err := db.Exec(fmt.Sprintf(`
		UPDATE %s
		SET display_order = display_order - 10
		WHERE %s = %d
		AND display_order BETWEEN %d AND %d`,
			tableName, corellationField, corellationValue, reorderable.GetDisplayOrder(), payload.GetDisplayOrder()))
		if err != nil {
			log.Fatal(err)
		}
		// If display order has decreased, then item appears before its sibling with the same display order
	} else if payload.GetDisplayOrder() < reorderable.GetDisplayOrder() {
		_, err := db.Exec(fmt.Sprintf(`
		UPDATE %s
		SET display_order = display_order + 10
		WHERE %s = %d
		AND display_order BETWEEN %d AND %d`,
			tableName, corellationField, corellationValue, payload.GetDisplayOrder(), reorderable.GetDisplayOrder()))
		if err != nil {
			log.Fatal(err)
		}
	}
}

func DeleteReorderable[T Reorderable](db *sql.DB, reorderable T, tableName string, corellationField string, corellationValue int) {
	_, err := db.Exec(fmt.Sprintf(`
	UPDATE %s
	SET display_order = display_order - 10
	WHERE %s = %d
	AND display_order > %d`,
		tableName, corellationField, corellationValue, reorderable.GetDisplayOrder()))
	if err != nil {
		log.Fatal(err)
	}
}

func UpdateList(db *sql.DB, list *FancyList, owner *User, payload *BaseReorderablePayload) *FancyList {
	ReorderReorderable(db, list, payload, "fancylists", "owner", owner.Id)

	UpdateReorderable(list, payload)
	_, err := db.Exec(`
	UPDATE fancylists
	SET
		name = ?,
		display_order = ?
	WHERE id = ?`,
		list.Name, list.DisplayOrder, list.Id)
	if err != nil {
		log.Fatal(err)
	}

	return list
}

func DeleteList(db *sql.DB, list *FancyList, owner *User) {
	_, err := db.Exec("DELETE FROM fancylists WHERE id = ?", list.Id)
	if err != nil {
		log.Fatal(err)
	}

	DeleteReorderable(db, list, "fancylists", "owner", owner.Id)
}

func GetCategoryById(db *sql.DB, id int) (*Category, *FancyList, error) {
	row := db.QueryRow(`
	SELECT
		c.id, c.name, c.fancylist, c.display_order,
		f.id, f.name, f.created_date, f.owner, f.display_order
	FROM categories c
	JOIN fancylists f ON f.id = c.fancylist
	WHERE c.id = ?`,
		id)

	category := Category{}
	list := FancyList{}

	err := row.Scan(
		&category.Id, &category.Name, &category.FancyList, &category.DisplayOrder,
		&list.Id, &list.Name, &list.CreatedDate, &list.Owner, &list.DisplayOrder,
	)
	if err != nil {
		return nil, nil, err
	}

	return &category, &list, nil
}

func GetListCategories(db *sql.DB, list int) ([]*Category, error) {
	rows, err := db.Query(`
	SELECT c.id, c.name, c.fancylist, c.display_order
	FROM categories c
	WHERE c.fancylist = ?
	ORDER BY c.display_order ASC`,
		list)
	if err != nil {
		return nil, err
	}

	categories := []*Category{}
	for rows.Next() {
		category := Category{}
		err := rows.Scan(&category.Id, &category.Name, &category.FancyList, &category.DisplayOrder)
		if err != nil {
			log.Fatal(err)
		}

		categoryItems, err := GetCategoryItems(db, category.Id)
		if err != nil {
			return nil, err
		}

		category.Items = categoryItems
		categories = append(categories, &category)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

func CreateCategory(db *sql.DB, name string, fancylist int) (*Category, error) {
	result, err := db.Exec(`
	INSERT INTO categories (name, fancylist, display_order)
	VALUES (?, ?, (SELECT COALESCE(MAX(display_order), 0) + 10 FROM categories WHERE fancylist = ?))`,
		name, fancylist, fancylist)
	if err != nil {
		log.Fatal(err)
	}

	lastInsertId, err := result.LastInsertId()
	if err != nil {
		log.Fatal("CreateCategory: lastInsertId: ", err)
	}

	category, _, err := GetCategoryById(db, int(lastInsertId))
	if err != nil {
		log.Fatal("CreateCategory: GetCategoryById: ", err)
	}

	return category, nil
}

func UpdateCategory(db *sql.DB, category *Category, list *FancyList, payload *BaseReorderablePayload) *Category {
	ReorderReorderable(db, category, payload, "categories", "fancylist", list.Id)

	UpdateReorderable(category, payload)
	_, err := db.Exec(`
	UPDATE categories
	SET
		name = ?,
		display_order = ?
	WHERE id = ?`,
		category.Name, category.DisplayOrder, category.Id)
	if err != nil {
		log.Fatal(err)
	}

	return category
}

func DeleteCategory(db *sql.DB, category *Category, list *FancyList) {
	_, err := db.Exec("DELETE FROM categories WHERE id = ?", category.Id)
	if err != nil {
		log.Fatal(err)
	}

	DeleteReorderable(db, category, "categories", "fancylist", list.Id)
}

func GetItemById(db *sql.DB, id int) (*Item, *Category, *FancyList, error) {
	row := db.QueryRow(`
	SELECT
		i.id, i.name, i.category, i.display_order,
		c.id, c.name, c.fancylist, c.display_order,
		f.id, f.name, f.created_date, f.owner, f.display_order
	FROM items i
	JOIN categories c ON c.id = i.category
	JOIN fancylists f ON f.id = c.fancylist
	WHERE i.id = ?`,
		id)

	item := Item{}
	category := Category{}
	list := FancyList{}

	err := row.Scan(
		&item.Id, &item.Name, &item.Category, &item.DisplayOrder,
		&category.Id, &category.Name, &category.FancyList, &category.DisplayOrder,
		&list.Id, &list.Name, &list.CreatedDate, &list.Owner, &list.DisplayOrder,
	)
	if err != nil {
		return nil, nil, nil, err
	}

	return &item, &category, &list, nil
}

func GetListItems(db *sql.DB, list int) ([]*Item, error) {
	rows, err := db.Query(`
	SELECT i.id, i.name, i.category, i.display_order
	FROM fancylists f
	JOIN categories c ON c.fancylist = f.id
	JOIN items i ON i.category = c.id
	WHERE f.id = ?
	ORDER BY i.display_order ASC`,
		list)
	if err != nil {
		return nil, err
	}

	items := []*Item{}
	for rows.Next() {
		item := Item{}
		err := rows.Scan(&item.Id, &item.Name, &item.Category, &item.DisplayOrder)
		if err != nil {
			log.Fatal(err)
		}
		items = append(items, &item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func GetCategoryItems(db *sql.DB, category int) ([]*Item, error) {
	rows, err := db.Query(`
	SELECT i.id, i.name, i.category, i.display_order
	FROM items i
	WHERE i.category = ?
	ORDER BY i.display_order ASC`,
		category)
	if err != nil {
		return nil, err
	}

	items := []*Item{}
	for rows.Next() {
		item := Item{}
		err := rows.Scan(&item.Id, &item.Name, &item.Category, &item.DisplayOrder)
		if err != nil {
			log.Fatal(err)
		}

		items = append(items, &item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func CreateItem(db *sql.DB, name string, category int) (*Item, error) {
	result, err := db.Exec(`
	INSERT INTO items (name, category, display_order)
	VALUES (?, ?, (SELECT COALESCE(MAX(display_order), 0) + 10 FROM items WHERE category = ?))`,
		name, category, category)
	if err != nil {
		log.Fatal(err)
	}

	lastInsertId, err := result.LastInsertId()
	if err != nil {
		log.Fatal("CreateCategory: lastInsertId: ", err)
	}

	item, _, _, err := GetItemById(db, int(lastInsertId))
	if err != nil {
		log.Fatal("CreateItem: GetItemById: ", err)
	}

	return item, nil
}

func UpdateItem(db *sql.DB, item *Item, category *Category, payload *UpdateItemPayload) *Item {
	ReorderReorderable(db, item, payload, "items", "category", category.Id)

	UpdateReorderable(item, payload)
	_, err := db.Exec(`
	UPDATE items
	SET
		name = ?,
		category = ?,
		display_order = ?
	WHERE id = ?`,
		item.Name, item.Category, item.DisplayOrder, item.Id)
	if err != nil {
		log.Fatal(err)
	}

	return item
}

func DeleteItem(db *sql.DB, item *Item, category *Category) {
	_, err := db.Exec("DELETE FROM items WHERE id = ?", item.Id)
	if err != nil {
		log.Fatal(err)
	}

	DeleteReorderable(db, item, "items", "category", category.Id)
}
