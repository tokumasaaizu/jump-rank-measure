package repository

// User DB へのアクセス層。

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// User は、users テーブルのレコードを表す構造体です。
type User struct {
	ID        int
	Name      string
	CreatedAt time.Time
}

// UserRepository は、users テーブルへのアクセスを提供します。
type UserRepository struct {
	// DB 接続プールをフィールドに持ちます。これを使って DB へのクエリを実行します。
	pool *pgxpool.Pool
}

// NewUserRepository は、UserRepository のコンストラクタです。
func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	// UserRepository のインスタンスを作成して返します。
	return &UserRepository{pool: pool}
}

// FindAll は、全てのユーザを取得します。
func (r *UserRepository) FindAll(ctx context.Context) ([]User, error) {

	// DB から全てのユーザを取得するためのクエリを実行します。エラーがあればそれを返します。
	rows, err := r.pool.Query(ctx,
		`SELECT id, name, created_at
		 FROM users
		 ORDER BY id`)
	if err != nil {
		return nil, err
	}
	// クエリの結果を処理するために、rows をクローズする必要があります。defer を使って関数の最後でクローズするようにします。
	defer rows.Close()

	// クエリの結果からユーザのリストを作成します。
	var users []User

	// rows.Next() を使ってクエリの結果をループ処理します。各行からユーザの情報を読み取って、users スライスに追加します。
	for rows.Next() {
		var u User
		// rows.Scan() を使って、現在の行からユーザの情報を読み取ります。エラーがあればそれを返します。
		if err := rows.Scan(&u.ID, &u.Name, &u.CreatedAt); err != nil {
			return nil, err
		}
		// 読み取ったユーザの情報を users スライスに追加します。
		users = append(users, u)
	}

	// クエリの結果を返します。エラーがあればそれも返します。
	return users, rows.Err()
}

// Create は、新しいユーザを作成します。
func (r *UserRepository) Create(ctx context.Context, name string) (User, error) {

	var u User

	// DB に新しいユーザを挿入するためのクエリを実行します。
	// 挿入されたユーザの ID、名前、作成日時を取得して、User 構造体に格納します。エラーがあればそれを返します。
	err := r.pool.QueryRow(ctx,
		`INSERT INTO users (name)
		 VALUES ($1)
		 RETURNING id, name, created_at`,
		name,
	).Scan(&u.ID, &u.Name, &u.CreatedAt)

	// クエリの実行結果を返します。エラーがあればそれも返します。
	return u, err
}
