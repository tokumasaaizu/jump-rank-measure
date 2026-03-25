package main

// エントリーポイント専用。
// 設定読み込み、DB接続、ルーティング登録、サーバ起動といった「配線だけ」やる

import (
	"log"
	"net/http"
	"fmt"
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


	host := "postgre.cjocsycgq4mo.ap-northeast-1.rds.amazonaws.com"
	port := "5432"
	user := "tokumin"
	pass := "masayuki7919"
	dbname := "postgres"
	
	// 2. 接続文字列の構築
	// RDSではセキュリティのため sslmode=verify-full または require が推奨されます
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=verify-full&sslrootcert=/app/global-bundle.pem",
		user, pass, host, port, dbname)


	//dsn := "postgres://appuser:apppass@localhost:5432/appdb"
	//dsn := "postgres://appuser:apppass@host.docker.internal:5432/appdb"
	// DB接続プールの作成(DB接続の初期化)
	pool, err := db.NewPostgresPool(dsn)
	if err != nil {
		log.Fatal(err)
	}
	// プールは使い終わったらクローズする必要があります。defer を使って main 関数の最後でクローズするようにします。
	defer pool.Close()

	// リポジトリ、サービス、ハンドラーの初期化(user)
	//userRepo := repository.NewUserRepository(pool)
	//userService := service.NewUserService(userRepo)
	//userHandler := handler.NewUserHandler(userService)

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
	//userHandler.RegisterRoutes()
	//worksHandler.RegisterRoutes()
	r := chi.NewRouter()
	//userHandler.RegisterRoutes(r)
	worksHandler.RegisterRoutes(r)
	workDetailHandler.RegisterRoutes(r)
	rankingHandler.RegisterRoutes(r)
	volumeHandler.RegisterRoutes(r)
	issueHandler.RegisterRoutes(r)

	log.Println("server start :8080")
	// サーバ起動
	log.Fatal(http.ListenAndServe(":8080", r))
}
