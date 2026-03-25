package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID        int
	Name      string
	CreatedAt time.Time
}

var pool *pgxpool.Pool

func Init() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. 環境変数から接続情報を取得（ハードコードを避ける）
	//host := os.Getenv("DB_HOST") // RDSのエンドポイント
	//port := os.Getenv("DB_PORT") // 通常は 5432
	//user := os.Getenv("DB_USER")
	//pass := os.Getenv("DB_PASSWORD")
	//dbname := os.Getenv("DB_NAME")
	host := "postgre.cjocsycgq4mo.ap-northeast-1.rds.amazonaws.com"
	port := "5432"
	user := "tokumin"
	pass := "masayuki7919"
	dbname := "postgres"
	
	// 2. 接続文字列の構築
	// RDSではセキュリティのため sslmode=verify-full または require が推奨されます
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=verify-full",
		user, pass, host, port, dbname)
	
	//dsn := "postgres://appuser:apppass@localhost:5432/appdb"

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return fmt.Errorf("config parse error: %w", err)
	}

	// 3. RDS/サーバーレス向けの接続プール設定
	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnIdleTime = 5 * time.Minute // アイドル接続を放置しない

	pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("connection error: %w", err)
	}

	return pool.Ping(ctx)
}

/**
func GetUsers(ctx context.Context) ([]User, error) {
	// 既存のロジックは概ね良好ですが、スライスを事前にmakeしておくと効率的です
	rows, err := pool.Query(ctx,
		`SELECT id, name, created_at
         FROM users
         ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]User, 0) // 空スライスで初期化

	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, rows.Err()
}
*/

func Close() {
	if pool != nil {
		pool.Close()
	}
}