package handler

// Works の HTTP ハンドラー。役割は、HTTPリクエストを受け取り、WorksService を呼び出して処理し、HTTPレスポンスを返すことです。

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"
	"fmt"
	"backend/src/internal/service"
	"backend/src/internal/model"
)

// WorksHandler は WorksService を使って HTTP リクエストを処理します。
type WorksHandler struct {
	service *service.WorksService
}

// NewWorksHandler は WorksHandler のコンストラクタです。
func NewWorksHandler(s *service.WorksService) *WorksHandler {
	return &WorksHandler{service: s}
}

// RegisterRoutes は HTTP ハンドラーをルーティングに登録します。
func (h *WorksHandler) RegisterRoutes(r chi.Router) {
	r.HandleFunc("/works", h.works)
}

// works は /works エンドポイントの HTTP ハンドラーです。GET と POST メソッドを処理します。
func (h *WorksHandler) works(w http.ResponseWriter, r *http.Request) {

	// HTTP メソッドによって処理を分けます。
	switch r.Method {

	// GET メソッドの場合は、WorksService の GetWorks を呼び出して作品のリストを取得し、JSON でレスポンスを返します。
	case http.MethodGet:

		// WorksService(service/works.go) の GetWorks を呼び出して作品のリストを取得します。
		manga, err := h.service.GetWorks(r.Context())
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		// 取得した作品のリストを JSON でレスポンスとして返します。
		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.Header().Set("Content-Type", "application/json")
		// HTTP ステータスコード 200 OK を設定します。
		json.NewEncoder(w).Encode(manga)

	// POST メソッドの場合は、リクエストボディからユーザーの名前を読み取り、WorkService の CreateWorks を呼び出して新しい作品を作成し、JSON でレスポンスを返します。
	case http.MethodPost:

		// リクエストボディから作品の名前を読み取るための構造体を定義します。
		/**type Volume struct {
			Volume      int    `json:"volume"`
			ReleaseDate string `json:"releaseDate"`
			CoverImage  string `json:"coverImage"`
			Price       int    `json:"price"`
			ISBN        string `json:"isbn"`
			Description string `json:"description"`
			Pages       int    `json:"pages"`
		}*/
		var input struct {
			WorkID int `json:"work_id"`
			Title  string `json:"title"`
			TitleKana string `json:"title_kana"`
			TitleEn string `json:"title_en"`
			Author string `json:"author"`
			Image  string `json:"image"`
			Story string `json:"story"`
			Volumes []model.Volume `json:"volumes"`
		}

		// リクエストボディを JSON としてデコードします。エラーがあれば 400 Bad Request を返します。
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}


		// WorksService の CreateWorks を呼び出して新しい作品を作成します。エラーがあれば 400 Bad Request を返します。
		works, err := h.service.CreateWorks(r.Context(),
		 input.WorkID,input.Title, input.TitleKana, input.TitleEn, input.Author, input.Image, input.Story, input.Volumes)
		fmt.Println("test : ",input.Title)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		// 作成した作品を JSON でレスポンスとして返します。HTTP ステータスコード 201 Created を設定します。
		w.Header().Set("Content-Type", "application/json")
		// HTTP ステータスコード 201 Created を設定します。
		w.WriteHeader(http.StatusCreated)
		// 作成した作品を JSON でレスポンスとして返します。
		json.NewEncoder(w).Encode(works)

	case http.MethodPut:

		// 1. リクエストボディの構造体を定義（または共通の型を使用）
    	var req struct {
        	Titles []string `json:"titles"`
    	}

    	// 2. JSONデコード
    	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        	http.Error(w, "Invalid request body", http.StatusBadRequest)
        	return
    	}
		// 3. バリデーション：空のリストが送られてきた場合、全作品が完結扱いになるのを防ぐ
		if len(req.Titles) == 0 {
			http.Error(w, "Titles list cannot be empty", http.StatusBadRequest)
			return
		}

		// 4. サービス層へタイトルリストを渡す（UpdateEndFlog の定義も修正が必要）
		err := h.service.UpdateEndFlog(r.Context(), req.Titles)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// 5. レスポンス設定
		w.Header().Set("Access-Control-Allow-Origin", "https://jump-rank.toma39blog.com")
		w.WriteHeader(http.StatusNoContent)


	// その他の HTTP メソッドの場合は、405 Method Not Allowed を返します。
	default:
		http.Error(w, "method not allowed", 405)
	}
}
