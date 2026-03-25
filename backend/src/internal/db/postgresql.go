package db

// PostgreSQL接続管理だけ。
// 接続プール生成、RDS接続文字列対応、Close処理を行う

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresPool は、指定された DSN を使用して PostgreSQL 接続プールを作成し、接続が成功するかどうかを確認します。
// 接続が成功した場合はプールを返し、失敗した場合はエラーを返します。
func NewPostgresPool(dsn string) (*pgxpool.Pool, error) {
	// 接続プールの作成には、pgxpool.New を使用します。接続の確認には、pgxpool.Pool の Ping メソッドを使用します。
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// pgxpool.New は、指定された DSN を使用して接続プールを作成します。エラーが発生した場合は、エラーを返します。
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, err
	}

	// 接続が成功するかどうかを確認するために、pgxpool.Pool の Ping メソッドを使用します。エラーが発生した場合は、エラーを返します。
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	// 接続が成功した場合は、接続プールを返します。
	return pool, nil
}
