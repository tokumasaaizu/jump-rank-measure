package handler

// User の HTTP ハンドラー。役割は、HTTPリクエストを受け取り、UserService を呼び出して処理し、HTTPレスポンスを返すことです。

import (
	"encoding/json"
	"net/http"

	"backend/src/internal/service"
)

// UserHandler は UserService を使って HTTP リクエストを処理します。
type UserHandler struct {
	service *service.UserService
}

// NewUserHandler は UserHandler のコンストラクタです。
func NewUserHandler(s *service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

// RegisterRoutes は HTTP ハンドラーをルーティングに登録します。
func (h *UserHandler) RegisterRoutes() {
	http.HandleFunc("/users", h.users)
}

// users は /users エンドポイントの HTTP ハンドラーです。GET と POST メソッドを処理します。
func (h *UserHandler) users(w http.ResponseWriter, r *http.Request) {

	// HTTP メソッドによって処理を分けます。
	switch r.Method {

	// GET メソッドの場合は、UserService の GetUsers を呼び出してユーザーのリストを取得し、JSON でレスポンスを返します。
	case http.MethodGet:

		// UserService(service/user.go) の GetUsers を呼び出してユーザーのリストを取得します。
		users, err := h.service.GetUsers(r.Context())
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		// 取得したユーザーのリストを JSON でレスポンスとして返します。
		w.Header().Set("Content-Type", "application/json")
		// HTTP ステータスコード 200 OK を設定します。
		json.NewEncoder(w).Encode(users)

	// POST メソッドの場合は、リクエストボディからユーザーの名前を読み取り、UserService の CreateUser を呼び出して新しいユーザーを作成し、JSON でレスポンスを返します。
	case http.MethodPost:

		// リクエストボディからユーザーの名前を読み取るための構造体を定義します。
		var input struct {
			Name string `json:"name"`
		}

		// リクエストボディを JSON としてデコードします。エラーがあれば 400 Bad Request を返します。
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid json", 400)
			return
		}

		// UserService の CreateUser を呼び出して新しいユーザーを作成します。エラーがあれば 400 Bad Request を返します。
		user, err := h.service.CreateUser(r.Context(), input.Name)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		// 作成したユーザーを JSON でレスポンスとして返します。HTTP ステータスコード 201 Created を設定します。
		w.Header().Set("Content-Type", "application/json")
		// HTTP ステータスコード 201 Created を設定します。
		w.WriteHeader(http.StatusCreated)
		// 作成したユーザーを JSON でレスポンスとして返します。
		json.NewEncoder(w).Encode(user)

	// その他の HTTP メソッドの場合は、405 Method Not Allowed を返します。
	default:
		http.Error(w, "method not allowed", 405)
	}
}
