package main

// エントリーポイント専用。
// 設定読み込み、DB接続、ルーティング登録、サーバ起動といった「配線だけ」やる

import (
	"log"
	"net/http"
	"fmt"
	"os"
	"github.com/go-chi/chi/v5"
	// ここでは、DB接続の初期化、リポジトリ、サービス、ハンドラーの初期化、ルーティング登録、サーバ起動などを行います。
	// backend という名前は go.mod で定義されているモジュール名です。
	// これを使って、src/internal/db...src/internal/handler などのパッケージをインポートします。
	"backend/src/internal/db"
	"backend/src/internal/handler"
	"backend/src/internal/repository"
	"backend/src/internal/service"
	//"github.com/jackc/pgx/v5/pgxpool"
)

//var pool *pgxpool.Pool

func main() {


	// 環境変数があればそれを使い、なければ本番(RDS)向けの値を使う
	host := getenv("DB_HOST", "postgre.xxxx.amazonaws.com")
	port := getenv("DB_PORT", "xxxx")
	user := getenv("DB_USER", "xxxx")
	pass := getenv("DB_PASSWORD", "xxxx")
	dbname := getenv("DB_NAME", "xxxx")
	// ローカルの PostgreSQL では DB_SSL_PARAMS="sslmode=disable" を指定する
	sslParams := getenv("DB_SSL_PARAMS", "sslmode=verify-full&sslrootcert=/app/global-bundle.pem")

	// 2. 接続文字列の構築
	// RDSではセキュリティのため sslmode=verify-full または require が推奨されます
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?%s",
		user, pass, host, port, dbname, sslParams)


	// DB接続プールの作成(DB接続の初期化)
	pool, err := db.NewPostgresPool(dsn)
	if err != nil {
		log.Fatal(err)
	}
	// プールは使い終わったらクローズする必要があります。defer を使って main 関数の最後でクローズするようにします。
	defer pool.Close()

	worksRepo := repository.NewWorksRepository(pool)
	rankingRepo := repository.NewRankingRepository(pool)
	volumeRepo := repository.NewVolumeRepository(pool)
	issueRepo := repository.NewIssueRepository(pool)

	worksService := service.NewWorksService(worksRepo)
	rankingService := service.NewRankingService(rankingRepo)
	volumeService := service.NewVolumeService(volumeRepo)
	issueService := service.NewIssueService(issueRepo)

	worksHandler := handler.NewWorksHandler(worksService)
	rankingHandler := handler.NewRankingHandler(rankingService)
	volumeHandler := handler.NewVolumeHandler(volumeService)
	workDetailHandler := handler.NewWorkDetailHandler(worksService)
	issueHandler := handler.NewIssueHandler(issueService)

	// ルーティング登録(HTTPリクエストとハンドラーの紐付け)
	r := chi.NewRouter()
	worksHandler.RegisterRoutes(r)
	workDetailHandler.RegisterRoutes(r)
	rankingHandler.RegisterRoutes(r)
	volumeHandler.RegisterRoutes(r)
	issueHandler.RegisterRoutes(r)

	log.Println("server start :8080")
	// サーバ起動
	log.Fatal(http.ListenAndServe(":8080", r))
}

// getenv は環境変数 key の値を返します。未設定なら fallback を返します。
func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
